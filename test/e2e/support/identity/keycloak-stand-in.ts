import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

const REALM = 'e2e';
const CLIENT_ID = 'identity-admin';
const CLIENT_SECRET = 'e2e-secret';
const ADMIN = `/admin/realms/${REALM}/`;

/** The variables the identity context reads at each call of its administration connection. */
const VARIABLES = [
  'KEYCLOAK_URL',
  'KEYCLOAK_REALM',
  'IDENTITY_PROVIDER_ADMIN_CLIENT_ID',
  'IDENTITY_PROVIDER_ADMIN_CLIENT_SECRET',
];

interface StoredOrganisation {
  readonly id: string;
  readonly alias: string;
  readonly name: string;
}

/** One request received by the stand-in, with what the route needs of it. */
interface Asked {
  readonly method: string;
  readonly url: URL;
  readonly body: string;
  readonly response: ServerResponse;
  readonly organisations: Map<string, StoredOrganisation>;
}

/**
 * Stands for the administration API of Keycloak 26 on a local server, for the end-to-end specs of
 * identity: the connection of the context is read from the environment at each call, so the spec
 * points it here while it runs and gives the variables back on close. It answers the token grant
 * and the organisations the context opens, by alias, as a realm does.
 */
export async function startKeycloakStandIn(): Promise<{ close: () => Promise<void> }> {
  const organisations = new Map<string, StoredOrganisation>();
  const server = createServer((request, response) => void answer(request, response, organisations));

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const previous = VARIABLES.map((name) => [name, process.env[name]] as const);

  Object.assign(process.env, {
    KEYCLOAK_URL: urlOf(server),
    KEYCLOAK_REALM: REALM,
    IDENTITY_PROVIDER_ADMIN_CLIENT_ID: CLIENT_ID,
    IDENTITY_PROVIDER_ADMIN_CLIENT_SECRET: CLIENT_SECRET,
  });

  return { close: () => stop(server, previous) };
}

function urlOf(server: Server): string {
  const address = server.address() as AddressInfo;

  return `http://127.0.0.1:${address.port}`;
}

async function stop(server: Server, previous: readonly (readonly [string, string | undefined])[]): Promise<void> {
  for (const [name, value] of previous) {
    if (value === undefined) {
      Reflect.deleteProperty(process.env, name);
    } else {
      process.env[name] = value;
    }
  }

  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}

async function answer(
  request: IncomingMessage,
  response: ServerResponse,
  organisations: Map<string, StoredOrganisation>,
): Promise<void> {
  const asked: Asked = {
    method: request.method ?? 'GET',
    url: new URL(request.url ?? '/', 'http://stand-in'),
    body: await readBody(request),
    response,
    organisations,
  };

  if (asked.method === 'POST' && asked.url.pathname === `/realms/${REALM}/protocol/openid-connect/token`) {
    send(response, 200, { access_token: 'stand-in-token', token_type: 'Bearer' });
  } else if (asked.url.pathname.startsWith(ADMIN)) {
    administration(asked, asked.url.pathname.slice(ADMIN.length));
  } else {
    send(response, 404, { error: 'not_found' });
  }
}

function administration(asked: Asked, path: string): void {
  if (asked.method === 'GET' && path === 'organizations') {
    listOrganisations(asked);
  } else if (asked.method === 'POST' && path === 'organizations') {
    createOrganisation(asked);
  } else if (isMemberPath(path, asked.organisations)) {
    send(asked.response, asked.method === 'DELETE' ? 204 : 201, undefined);
  } else if (asked.method === 'PUT' && path.startsWith('users/')) {
    send(asked.response, 204, undefined);
  } else {
    send(asked.response, 404, { error: 'not_found' });
  }
}

function listOrganisations({ url, response, organisations }: Asked): void {
  const first = Number(url.searchParams.get('first') ?? '0');
  const max = Number(url.searchParams.get('max') ?? '100');

  send(response, 200, [...organisations.values()].slice(first, first + max));
}

function createOrganisation({ body, response, organisations }: Asked): void {
  const { name, alias } = JSON.parse(body) as { name: string; alias: string };

  if (organisations.has(alias)) {
    send(response, 409, { error: 'conflict' });
  } else {
    organisations.set(alias, { id: `kc-${alias}`, alias, name });
    send(response, 201, undefined);
  }
}

function isMemberPath(path: string, organisations: Map<string, StoredOrganisation>): boolean {
  const member = /^organizations\/([^/]+)\/members(\/[^/]+)?$/.exec(path);

  return member !== null && [...organisations.values()].some((one) => one.id === member[1]);
}

function send(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(payload === undefined ? undefined : JSON.stringify(payload));
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}
