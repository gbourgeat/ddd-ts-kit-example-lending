import { describe, expect, it } from '@jest/globals';
import { PolicyAccess, type Permission } from '@ddd-ts-kit/auth';
import { defineSchema, InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { RequestPersonalDataCopyLinkCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy-link/request-personal-data-copy-link.command';
import { RequestPersonalDataCopyLinkHandler } from '@/contexts/data-protection/application/commands/request-personal-data-copy-link/request-personal-data-copy-link.handler';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { RequestPersonalDataCopyHandler } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.handler';
import { FakePersonalDataGathering } from '@/contexts/data-protection/test/fakes/personal-data-gathering.fake';
import { FakeCopyOfDataStore } from '@/contexts/data-protection/test/fakes/copy-of-data-store.fake';

const requestCopy: Permission = dataProtectionPermissions['data-subject.request-copy'];

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

const ISSUED_AT = new Date('2026-10-27T08:00:00.000Z');
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const self = anActor().named('customer-1').build();
const stranger = anActor().named('stranger').build();

describe('Request personal data copy link', () => {
  it('answers a fresh one-hour link to the copy of the customer while it is kept', async () => {
    const { commandBus, copyId } = await arrange();

    const link = await commandBus.execute(new RequestPersonalDataCopyLinkCommand(self, 'customer-1', copyId));

    expect(link.url).toBe(`https://files.example.test/customer-1/${copyId}?token=t`);
  });

  it('refuses with FORBIDDEN a stranger asking for the link of the copy', async () => {
    const { commandBus, copyId } = await arrange();
    const command = new RequestPersonalDataCopyLinkCommand(stranger, 'customer-1', copyId);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses with FILE_NOT_FOUND a copy that was never made for the customer', async () => {
    const { commandBus } = await arrange();
    const command = new RequestPersonalDataCopyLinkCommand(self, 'customer-1', 'copy-unknown');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FILE_NOT_FOUND' });
  });

  it('refuses with FILE_NOT_FOUND a copy kept seven days, and deletes it', async () => {
    const { commandBus, copies, copyId, moveTo } = await arrange();

    moveTo(new Date(ISSUED_AT.getTime() + SEVEN_DAYS_MS));
    const command = new RequestPersonalDataCopyLinkCommand(self, 'customer-1', copyId);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FILE_NOT_FOUND' });

    expect(await copies.storedAt('customer-1', copyId)).toBeUndefined();
  });
});

async function arrange() {
  const store = new InMemoryRelationTupleStore();
  const authorizer = new RelationBasedAuthorizer({ schema, store });

  await store.write([{ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' }]);

  let now = ISSUED_AT;
  const clock = { now: () => now };
  const access = new PolicyAccess({ authorizer, clock: new FixedClock(ISSUED_AT) });
  const copies = new FakeCopyOfDataStore(() => now);
  const { commandBus } = createTestBuses();

  commandBus.register(
    RequestPersonalDataCopyCommand,
    new RequestPersonalDataCopyHandler(access, new FakePersonalDataGathering(), copies),
  );

  commandBus.register(
    RequestPersonalDataCopyLinkCommand,
    new RequestPersonalDataCopyLinkHandler(access, copies, clock),
  );

  const issued = await commandBus.execute(new RequestPersonalDataCopyCommand(self, 'customer-1'));

  return {
    commandBus,
    copies,
    copyId: issued.copyId,
    moveTo: (instant: Date) => {
      now = instant;
    },
  };
}
