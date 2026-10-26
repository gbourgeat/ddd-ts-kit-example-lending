import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { AcceptInvitationCommand } from '@/contexts/identity/application/commands/accept-invitation/accept-invitation.command';
import { AcceptInvitationController } from '@/contexts/identity/presentation/http/invitations/accept-invitation/accept-invitation.controller';
import { identityControllers } from '@/contexts/identity/identity.controllers';

/** Who calls, as the authenticator of the platform makes them from the token. */
const caller: Actor = {
  id: 'subject-ada',
  type: 'user',
  roles: [],
  attributes: { email: 'ada@example.test', username: 'ada' },
};

describe('POST /invitations/acceptance', () => {
  it('answers 200 with what the use case answered, and sends it what the request says', async () => {
    const { route, sent } = arrange();

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { token: 'token-1' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(route.path).toBe('/invitations/acceptance');
    expect([response.status, response.body]).toEqual([200, { id: 'invitation-1' }]);
    expect(sent).toMatchObject([{ token: 'token-1' }]);
  });

  it('refuses with 422 a request its contract does not describe, and sends nothing', async () => {
    const { route, sent } = arrange();

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
    expect(sent).toEqual([]);
  });

  it('is listed in the Nest controllers of the context, which say what its signature takes and answers', () => {
    expect(identityControllers).toContain(AcceptInvitationController);
  });
});

/** The route, on a bus that keeps what it was sent and answers as the use case would. */
function arrange() {
  const sent: AcceptInvitationCommand[] = [];

  const commands = new InMemoryCommandBus().register(AcceptInvitationCommand, {
    execute: async (command) => {
      sent.push(command);

      return 'invitation-1';
    },
  });

  const route = nestControllerRoute(AcceptInvitationController, {
    instanceOf: () => new AcceptInvitationController(commands),
    // A DTO without a decorated field accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return { route, sent };
}
