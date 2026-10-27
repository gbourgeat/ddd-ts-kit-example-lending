import { describe, expect, it } from '@jest/globals';
import { PolicyAccess, type Permission } from '@ddd-ts-kit/auth';
import { defineSchema, InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { RequestPersonalDataCopyHandler } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.handler';
import { FakePersonalDataGathering } from '@/contexts/data-protection/test/fakes/personal-data-gathering.fake';
import { FakeCopyOfDataStore } from '@/contexts/data-protection/test/fakes/copy-of-data-store.fake';

const requestCopy: Permission = dataProtectionPermissions['data-subject.request-copy'];

/** The relations of the schema this unit spec states: the customer's self and the operators of the context hold the copy. */
const schema = defineSchema({
  user: {},
  context: {
    relations: { operator: ['user'] },
    derived: { [requestCopy.id]: 'operator' },
  },
  customer: {
    relations: { self: ['user'] },
    derived: { [requestCopy.id]: 'self' },
  },
});

const self = anActor().named('customer-1').build();
const operator = anActor().named('ada').build();
const stranger = anActor().named('stranger').build();

describe('Request personal data copy', () => {
  it('answers the link that downloads the copy the store signed, to the customer', async () => {
    const { commandBus } = await arrange();

    const link = await commandBus.execute(new RequestPersonalDataCopyCommand(self, 'customer-1'));

    expect(link.url).toBe('https://files.example.test/copies/1');
  });

  it('answers the link to an operator of data-protection asking for the customer', async () => {
    const { commandBus } = await arrange();

    const link = await commandBus.execute(new RequestPersonalDataCopyCommand(operator, 'customer-1'));

    expect(link.url).toBe('https://files.example.test/copies/1');
  });

  it('gathers what the contexts keep of the customer, for the actor who asks', async () => {
    const { commandBus, gathering } = await arrange();

    await commandBus.execute(new RequestPersonalDataCopyCommand(self, 'customer-1'));

    expect(gathering.requests).toEqual([{ subject: 'customer-1', operator: self.id }]);
  });

  it('stores the gathered document as the one copy of the customer', async () => {
    const { commandBus, store } = await arrange();

    await commandBus.execute(new RequestPersonalDataCopyCommand(self, 'customer-1'));

    expect(store.stored.map((document) => document.subject)).toEqual(['customer-1']);
  });

  it('is refused with FORBIDDEN to a stranger who is neither the customer nor an operator', async () => {
    const { commandBus } = await arrange();
    const command = new RequestPersonalDataCopyCommand(stranger, 'customer-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('stores and gathers nothing when the command is refused', async () => {
    const { commandBus, gathering, store } = await arrange();

    await expect(commandBus.execute(new RequestPersonalDataCopyCommand(stranger, 'customer-1'))).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });

    expect(gathering.requests).toHaveLength(0);
    expect(store.stored).toHaveLength(0);
  });
});

async function arrange() {
  const store = new InMemoryRelationTupleStore();
  const authorizer = new RelationBasedAuthorizer({ schema, store });

  await store.write([
    { object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' },
    { object: 'context:data-protection', relation: 'operator', subject: 'user:ada' },
  ]);

  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const gathering = new FakePersonalDataGathering();
  const copies = new FakeCopyOfDataStore();
  const { commandBus } = createTestBuses();

  commandBus.register(RequestPersonalDataCopyCommand, new RequestPersonalDataCopyHandler(access, gathering, copies));

  return { commandBus, gathering, store: copies };
}
