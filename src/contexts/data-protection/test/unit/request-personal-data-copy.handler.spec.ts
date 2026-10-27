import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { RequestPersonalDataCopyHandler } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.handler';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [dataProtectionPermissions['data-subject.request-copy']] },
  }),
  map: AuthorizationMap.of(
    requires(RequestPersonalDataCopyCommand, dataProtectionPermissions['data-subject.request-copy']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Request personal data copy', () => {
  it('completes without answering anything', async () => {
    const { commandBus } = arrange();
    const command = new RequestPersonalDataCopyCommand(holder);

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission data-subject.request-copy', async () => {
    const { commandBus } = arrange();
    const command = new RequestPersonalDataCopyCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after the business behaviour of "request personal data copy": arrange with builders and fakes of its ports, execute through the bus, assert the outcome; when several specs of data-protection share this arrangement, `npx ddd-ts-kit generate test-world data-protection` writes it once in test/worlds/.
  it.todo('applies the business decision to the aggregate');
  it.todo('refuses the command when a business rule is violated, with the expected error code');
  it.todo('saves and publishes nothing when the command is refused');
});

function arrange() {
  const { commandBus } = createTestBuses();

  commandBus.use(holders).register(RequestPersonalDataCopyCommand, new RequestPersonalDataCopyHandler());

  return { commandBus };
}
