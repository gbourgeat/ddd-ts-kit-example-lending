import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryFileStorage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, creditApplicationPermissions['application.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();
const refusedOn = new Date('2026-01-10T09:00:00.000Z');
const sevenMonthsLater = new Date('2026-08-10T03:00:00.000Z');
const fiveMonthsLater = new Date('2026-06-10T03:00:00.000Z');

const approvingAssessment = {
  modelVersion: '2026.1',
  debtToIncomePercent: 20,
  repaymentIncidents: 0,
  residualIncomeCents: 160_000,
  score: 85,
  band: 'green',
  factors: [],
  proposedOutcome: 'approve',
} as const;

describe('Erase personal data past retention', () => {
  it('erases the documents of an application refused more than six months before', async () => {
    const { commandBus, storage } = await arrange();

    const erased = await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, sevenMonthsLater));

    expect(erased).toBe('1');
    expect(await storage.get('refused-1/accounts/figures.json')).toBeUndefined();
  });

  it('keeps the documents of an application refused less than six months before', async () => {
    const { commandBus, storage } = await arrange();

    const erased = await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, fiveMonthsLater));

    expect(erased).toBe('0');
    expect(await storage.get('refused-1/accounts/figures.json')).toBeDefined();
  });

  it('keeps the documents of an application that was approved, however old', async () => {
    const { commandBus, storage } = await arrange();

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, sevenMonthsLater));

    expect(await storage.get('approved-1/accounts/figures.json')).toBeDefined();
  });

  it('has the same outcome when the same occurrence runs twice', async () => {
    const { commandBus } = await arrange();
    const command = new ErasePersonalDataPastRetentionCommand(holder, sevenMonthsLater);

    await commandBus.execute(command);

    expect(await commandBus.execute(command)).toBe('1');
  });

  it('is refused to an actor who does not hold the permission application.erase-past-retention', async () => {
    const { commandBus } = await arrange();
    const command = new ErasePersonalDataPastRetentionCommand(anActor().build(), sevenMonthsLater);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange() {
  const { commandBus } = createTestBuses({ idPrefix: 'credit-application' });
  const repository = new FakeCreditApplicationRepository();
  const storage = new InMemoryFileStorage();

  for (const [id, outcome] of [
    ['refused-1', 'refuse'],
    ['approved-1', 'approve'],
  ] as const) {
    await repository.save(decidedApplication(id, outcome));

    await storage.put(`${id}/accounts/figures.json`, figures(), {
      mediaType: 'application/json',
    });
  }

  commandBus
    .use(holders)
    .register(ErasePersonalDataPastRetentionCommand, new ErasePersonalDataPastRetentionHandler(repository, storage));

  return { commandBus, storage };
}

/** An application with an account document, decided on `refusedOn`: refused or approved. */
function decidedApplication(id: string, outcome: 'refuse' | 'approve'): CreditApplication {
  const application = CreditApplication.create(id, 'customer-1', {
    amount: Money.ofCents(1_000_000),
    durationMonths: 60,
    registeredAt: refusedOn,
    branchId: 'branch-1',
  });

  application.attachDocument(
    { key: `${id}/accounts/figures.json`, mediaType: 'application/json', sizeBytes: 9 },
    refusedOn,
  );

  application.assess(approvingAssessment, refusedOn, 'assessor-1');

  application.decide({
    deciderId: 'decider-1',
    level: 'advisor',
    outcome,
    reasons: outcome === 'refuse' ? 'The debt is too high.' : '',
    conditions: '',
    approvedAmountCents: outcome === 'refuse' ? 0 : 1_000_000,
    decidedAt: refusedOn,
  });

  return application;
}

async function* figures(): AsyncIterable<Uint8Array> {
  yield new TextEncoder().encode('{"a":1}');
}
