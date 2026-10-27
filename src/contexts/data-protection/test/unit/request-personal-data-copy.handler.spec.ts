import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { RequestPersonalDataCopyHandler } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.handler';
import { FakePersonalDataGathering } from '@/contexts/data-protection/test/fakes/personal-data-gathering.fake';
import { FakeCopyOfDataStore } from '@/contexts/data-protection/test/fakes/copy-of-data-store.fake';

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
  it('answers the link that downloads the copy the store signed', async () => {
    const { commandBus } = arrange();

    const link = await commandBus.execute(new RequestPersonalDataCopyCommand(holder, 'customer-1'));

    expect(link.url).toBe('https://files.example.test/copies/1');
  });

  it('gathers what the contexts keep of the customer, for the operator who asks', async () => {
    const { commandBus, gathering } = arrange();

    await commandBus.execute(new RequestPersonalDataCopyCommand(holder, 'customer-1'));

    expect(gathering.requests).toEqual([{ subject: 'customer-1', operator: holder.id }]);
  });

  it('stores the gathered document as the one copy of the customer', async () => {
    const { commandBus, store } = arrange();

    await commandBus.execute(new RequestPersonalDataCopyCommand(holder, 'customer-1'));

    expect(store.stored.map((document) => document.subject)).toEqual(['customer-1']);
  });

  it('is refused to an actor who does not hold the permission data-subject.request-copy', async () => {
    const { commandBus } = arrange();
    const command = new RequestPersonalDataCopyCommand(anActor().build(), 'customer-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('stores and gathers nothing when the command is refused', async () => {
    const { commandBus, gathering, store } = arrange();

    await expect(
      commandBus.execute(new RequestPersonalDataCopyCommand(anActor().build(), 'customer-1')),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(gathering.requests).toHaveLength(0);
    expect(store.stored).toHaveLength(0);
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const gathering = new FakePersonalDataGathering();
  const store = new FakeCopyOfDataStore();

  commandBus
    .use(holders)
    .register(RequestPersonalDataCopyCommand, new RequestPersonalDataCopyHandler(gathering, store));

  return { commandBus, gathering, store };
}
