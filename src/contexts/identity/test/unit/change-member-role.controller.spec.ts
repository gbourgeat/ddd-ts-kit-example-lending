import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { ChangeMemberRoleCommand } from '@/contexts/identity/application/commands/change-member-role/change-member-role.command';
import { ChangeMemberRoleController } from '@/contexts/identity/presentation/http/organisations/change-member-role/change-member-role.controller';
import { identityControllers } from '@/contexts/identity/identity.controllers';

/** Who calls, as the authenticator of the platform makes them from the token. */
const caller: Actor = {
  id: 'subject-ada',
  type: 'user',
  roles: [],
  attributes: { email: 'ada@example.test', username: 'ada' },
};

describe('PUT /organisations/:organisationId/members/:accountId/role', () => {
  it('answers 200 with what the use case answered, and sends it what the request says', async () => {
    const { route, sent } = arrange();

    const response = await executeRoute(
      route,
      {
        params: { organisationId: 'acme', accountId: 'subject-grace' },
        query: {},
        headers: {},
        body: { role: 'member' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(route.path).toBe('/organisations/:organisationId/members/:accountId/role');
    expect([response.status, response.body]).toEqual([200, { id: 'member-1' }]);
    expect(sent).toMatchObject([{ organisationId: 'acme', accountId: 'subject-grace', role: 'member' }]);
  });

  it('refuses with 422 a request its contract does not describe, and sends nothing', async () => {
    const { route, sent } = arrange();

    const response = await executeRoute(
      route,
      {
        params: { organisationId: 'acme', accountId: 'subject-grace' },
        query: {},
        headers: {},
        body: { role: 'emperor' },
        raw: undefined,
      },
      { resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
    expect(sent).toEqual([]);
  });

  it('is listed in the Nest controllers of the context, which say what its signature takes and answers', () => {
    expect(identityControllers).toContain(ChangeMemberRoleController);
  });
});

/** The route, on a bus that keeps what it was sent and answers as the use case would. */
function arrange() {
  const sent: ChangeMemberRoleCommand[] = [];

  const commands = new InMemoryCommandBus().register(ChangeMemberRoleCommand, {
    execute: async (command) => {
      sent.push(command);

      return 'member-1';
    },
  });

  const route = nestControllerRoute(ChangeMemberRoleController, {
    instanceOf: () => new ChangeMemberRoleController(commands),
    // A DTO without a decorated field accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return { route, sent };
}
