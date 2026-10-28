import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { RequestHumanReviewCommand } from '@/contexts/credit-application/decision/application/commands/request-human-review/request-human-review.command';
import { RequestHumanReviewHandler } from '@/contexts/credit-application/decision/application/commands/request-human-review/request-human-review.handler';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { Money } from '@/shared-kernel/money.vo';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.request-review']] },
  }),
  map: AuthorizationMap.of(
    requires(RequestHumanReviewCommand, creditApplicationPermissions['application.request-review']),
  ),
});

const applicant = anActor().withRole('holder').build();
const APPLICATION_ID = 'credit-application-1';

describe('Request human review', () => {
  it('records the request of the applicant on a refusal the assessment proposed', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await saveAssessed(creditApplicationRepository, 'refuse', false);
    await commandBus.execute(new RequestHumanReviewCommand(applicant, APPLICATION_ID));

    const stored = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(stored?.toState().humanReview).toMatchObject({ requesterId: applicant.id });
  });

  it('records the request of the applicant on a decided refusal', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await saveAssessed(creditApplicationRepository, 'approve', true);
    await commandBus.execute(new RequestHumanReviewCommand(applicant, APPLICATION_ID));

    const stored = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(stored?.toState().humanReview).toMatchObject({ requesterId: applicant.id });
  });

  it('refuses a request on an approval, which has no refusal to review, by its code, and records nothing', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await saveAssessed(creditApplicationRepository, 'approve', false);

    const command = new RequestHumanReviewCommand(applicant, APPLICATION_ID);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'HUMAN_REVIEW_NOT_AVAILABLE' });
    expect((await creditApplicationRepository.findById(APPLICATION_ID))?.toState().humanReview).toBeUndefined();
  });

  it('refuses a request on an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();

    const command = new RequestHumanReviewCommand(applicant, APPLICATION_ID);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('is refused to an actor who does not hold the permission application.request-review', async () => {
    const { commandBus } = arrange();
    const command = new RequestHumanReviewCommand(anActor().build(), APPLICATION_ID);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const handler = new RequestHumanReviewHandler(creditApplicationRepository, clock);

  commandBus.use(holders).register(RequestHumanReviewCommand, handler);

  return { commandBus, creditApplicationRepository };
}

/** An application assessed with the outcome proposed; when `decided` is true, the decider refuses it. */
async function saveAssessed(
  repository: FakeCreditApplicationRepository,
  proposedOutcome: 'approve' | 'refuse',
  decided: boolean,
): Promise<void> {
  const application = CreditApplication.create(APPLICATION_ID, 'applicant-1', {
    amount: Money.ofCents(1_234_567),
    durationMonths: 60,
    registeredAt: new Date('2026-01-10T00:00:00.000Z'),
    branchId: '',
  });

  application.assess({ ...approvingAssessment, proposedOutcome }, new Date('2026-02-01T00:00:00.000Z'), 'assessor-1');

  if (decided) {
    application.decide({
      deciderId: 'decider-1',
      level: 'advisor',
      outcome: 'refuse',
      reasons: 'The debt is too high.',
      conditions: '',
      approvedAmountCents: 0,
      decidedAt: new Date('2026-02-02T00:00:00.000Z'),
    });
  }

  await repository.save(application);
}

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
