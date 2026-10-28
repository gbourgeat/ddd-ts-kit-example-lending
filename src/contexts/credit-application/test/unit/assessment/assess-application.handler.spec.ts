import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryFileStorage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { AssessApplicationCommand } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.command';
import { AssessApplicationHandler } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.handler';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeScoringGateway } from '@/contexts/credit-application/test/fakes/scoring-gateway.fake';
import { Money } from '@/shared-kernel/money.vo';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.assess']] },
  }),
  map: AuthorizationMap.of(requires(AssessApplicationCommand, creditApplicationPermissions['application.assess'])),
});

const holder = anActor().withRole('holder').build();
const APPLICATION_ID = 'credit-application-1';
const registeredAt = new Date('2026-01-10T00:00:00.000Z');

const greenScore = {
  score: 85,
  band: 'green',
  modelVersion: '2026.1',
  factors: ['Your debts take a share of your income that is close to the limit'],
};

const healthyFigures = { monthlyIncomeInCents: 250_000, monthlyExpensesInCents: 90_000 };

type Figures = { monthlyIncomeInCents: number; monthlyExpensesInCents: number };

/** What the file of the application holds before the assessment: the account information read, the register consulted. */
interface SeededFile {
  readonly figures?: Figures;
  readonly listedPartyCount?: number;
}

describe('Assess application', () => {
  it('proposes approve, with the model version, the inputs, the score and the factors, when the band is green and the residual income positive', async () => {
    const { commandBus, scoring, creditApplicationRepository, storage } = arrange();

    scoring.answers(greenScore);
    await seedFile(creditApplicationRepository, storage, { figures: healthyFigures, listedPartyCount: 0 });

    const answer = await commandBus.execute(new AssessApplicationCommand(holder, APPLICATION_ID));

    expect(answer).toEqual({
      applicationId: APPLICATION_ID,
      assessment: {
        modelVersion: '2026.1',
        debtToIncomePercent: 36,
        repaymentIncidents: 0,
        residualIncomeCents: 160_000,
        score: 85,
        band: 'green',
        factors: greenScore.factors,
        proposedOutcome: 'approve',
      },
    });
  });

  it('proposes a refusal, with the factors as reasons, when the register lists a party of the application', async () => {
    const { commandBus, scoring, creditApplicationRepository, storage } = arrange();

    scoring.answers({ ...greenScore, band: 'red', score: 40 });
    await seedFile(creditApplicationRepository, storage, { figures: healthyFigures, listedPartyCount: 1 });

    const answer = await commandBus.execute(new AssessApplicationCommand(holder, APPLICATION_ID));

    expect(answer.assessment).toMatchObject({
      repaymentIncidents: 1,
      band: 'red',
      proposedOutcome: 'refuse',
      factors: greenScore.factors,
    });
  });

  it('proposes a refusal when the residual income is negative, even with a green band', async () => {
    const { commandBus, scoring, creditApplicationRepository, storage } = arrange();

    scoring.answers(greenScore);

    await seedFile(creditApplicationRepository, storage, {
      figures: { monthlyIncomeInCents: 100_000, monthlyExpensesInCents: 120_000 },
      listedPartyCount: 0,
    });

    const answer = await commandBus.execute(new AssessApplicationCommand(holder, APPLICATION_ID));

    expect(answer.assessment).toMatchObject({ residualIncomeCents: -20_000, proposedOutcome: 'refuse' });
  });

  it('records the assessment in the file, announced with the save', async () => {
    const { commandBus, scoring, creditApplicationRepository, storage, domainEvents } = arrange();
    const assessed: CreditApplicationAssessed[] = [];

    domainEvents.on(CreditApplicationAssessed.eventName, async (event) => {
      assessed.push(event as CreditApplicationAssessed);
    });

    scoring.answers(greenScore);
    await seedFile(creditApplicationRepository, storage, { figures: healthyFigures, listedPartyCount: 0 });

    await commandBus.execute(new AssessApplicationCommand(holder, APPLICATION_ID));

    expect(assessed).toHaveLength(1);
    expect(assessed[0]?.assessment).toMatchObject({ modelVersion: '2026.1', proposedOutcome: 'approve' });
  });
});

describe('Assess application, refusals', () => {
  it('is refused to an actor who does not hold the permission application.assess', async () => {
    const { commandBus } = arrange();

    await expect(
      commandBus.execute(new AssessApplicationCommand(anActor().build(), APPLICATION_ID)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();

    await expect(
      commandBus.execute(new AssessApplicationCommand(holder, 'credit-application-404')),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('refuses without the account information, by its code, and saves nothing', async () => {
    const { commandBus, scoring, creditApplicationRepository, domainEvents } = arrange();
    const assessed: unknown[] = [];

    domainEvents.on(CreditApplicationAssessed.eventName, async (event) => {
      assessed.push(event);
    });

    scoring.answers(greenScore);
    await seedFile(creditApplicationRepository, undefined, { listedPartyCount: 0 });

    await expect(commandBus.execute(new AssessApplicationCommand(holder, APPLICATION_ID))).rejects.toMatchObject({
      code: 'MISSING_ACCOUNT_INFORMATION',
    });

    expect(assessed).toEqual([]);
  });

  it('refuses without the register consultation, by its code', async () => {
    const { commandBus, scoring, creditApplicationRepository, storage } = arrange();

    scoring.answers(greenScore);
    await seedFile(creditApplicationRepository, storage, { figures: healthyFigures });

    await expect(commandBus.execute(new AssessApplicationCommand(holder, APPLICATION_ID))).rejects.toMatchObject({
      code: 'REGISTER_NOT_CONSULTED',
    });
  });

  it('refuses when no version of the scoring model is published, by its code, and saves nothing', async () => {
    const { commandBus, scoring, creditApplicationRepository, storage, domainEvents } = arrange();
    const assessed: unknown[] = [];

    domainEvents.on(CreditApplicationAssessed.eventName, async (event) => {
      assessed.push(event);
    });

    scoring.answers(undefined);
    await seedFile(creditApplicationRepository, storage, { figures: healthyFigures, listedPartyCount: 0 });

    await expect(commandBus.execute(new AssessApplicationCommand(holder, APPLICATION_ID))).rejects.toMatchObject({
      code: 'NO_SCORE_AVAILABLE',
    });

    expect(assessed).toEqual([]);
  });
});

/** Files an application with the account information read as a document, and the register consulted for the applicant. */
async function seedFile(
  repository: FakeCreditApplicationRepository,
  storage: InMemoryFileStorage | undefined,
  file: SeededFile,
): Promise<void> {
  const application = CreditApplication.create(APPLICATION_ID, 'customer-1', {
    amount: Money.ofCents(1_234_567),
    durationMonths: 60,
    registeredAt,
    branchId: '',
  });

  if (file.figures !== undefined && storage !== undefined) {
    const key = await storeFigures(storage, file.figures);

    application.attachDocument({ key, mediaType: 'application/json', sizeBytes: 0 }, registeredAt);
  }

  if (file.listedPartyCount !== undefined) {
    const parties = [{ customerId: 'customer-1', listed: file.listedPartyCount > 0 }];

    application.recordRegisterConsultation(parties, registeredAt);
  }

  await repository.save(application);
}

async function storeFigures(storage: InMemoryFileStorage, figures: Figures): Promise<string> {
  const key = `${APPLICATION_ID}/accounts/2026-01-10T00-00-00-000Z.json`;
  const content = Buffer.from(JSON.stringify(figures), 'utf8');

  await storage.put(
    key,
    (async function* () {
      yield content;
    })(),
    { mediaType: 'application/json' },
  );

  return key;
}

function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application to `domainEvents`.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const storage = new InMemoryFileStorage();
  const scoring = new FakeScoringGateway();

  const handler = new AssessApplicationHandler(creditApplicationRepository, storage, scoring, clock);

  commandBus.use(holders).register(AssessApplicationCommand, handler);

  return { commandBus, creditApplicationRepository, storage, scoring, domainEvents };
}
