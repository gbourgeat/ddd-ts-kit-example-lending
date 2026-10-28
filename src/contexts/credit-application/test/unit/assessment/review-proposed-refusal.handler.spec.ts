import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReviewProposedRefusalCommand } from '@/contexts/credit-application/assessment/application/commands/review-proposed-refusal/review-proposed-refusal.command';
import { ReviewProposedRefusalHandler } from '@/contexts/credit-application/assessment/application/commands/review-proposed-refusal/review-proposed-refusal.handler';
import {
  CreditApplication,
  type CreditApplicationState,
} from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import type {
  AssessmentRecord,
  ProposedOutcome,
} from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { Money } from '@/shared-kernel/money.vo';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.review-refusal']] },
  }),
  map: AuthorizationMap.of(
    requires(ReviewProposedRefusalCommand, creditApplicationPermissions['application.review-refusal']),
  ),
});

const holder = anActor().withRole('holder').build();
const APPLICATION_ID = 'credit-application-1';
const ASSESSOR_ID = 'credit-analyst-1';
const registeredAt = new Date('2026-01-10T00:00:00.000Z');
const assessedAt = new Date('2026-01-11T00:00:00.000Z');

const confirmation = { conclusion: 'confirm', reason: 'The register lists the applicant.' } as const;

describe('Review proposed refusal', () => {
  it('records the conclusion of the review on the application, and answers its identifier', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await assessedApplication(creditApplicationRepository, 'refuse', ASSESSOR_ID);

    const id = await commandBus.execute(new ReviewProposedRefusalCommand(holder, APPLICATION_ID, confirmation));

    expect(id).toBe(APPLICATION_ID);
    expect(await stateOf(creditApplicationRepository)).toMatchObject({ refusalReviewConclusion: 'confirm' });
  });

  it('refuses a review by the person who ran the assessment, by its code', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await assessedApplication(creditApplicationRepository, 'refuse', holder.id);

    const command = new ReviewProposedRefusalCommand(holder, APPLICATION_ID, confirmation);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'REVIEWER_CANNOT_BE_ASSESSOR' });
  });

  it('refuses to review a proposal of approve, by its code', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await assessedApplication(creditApplicationRepository, 'approve', ASSESSOR_ID);

    const command = new ReviewProposedRefusalCommand(holder, APPLICATION_ID, confirmation);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'NO_REFUSAL_TO_REVIEW' });
  });

  it('refuses a second review of the same proposal, by its code', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await assessedApplication(creditApplicationRepository, 'refuse', ASSESSOR_ID);
    await commandBus.execute(new ReviewProposedRefusalCommand(holder, APPLICATION_ID, confirmation));

    const command = new ReviewProposedRefusalCommand(holder, APPLICATION_ID, confirmation);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'REFUSAL_ALREADY_REVIEWED' });
  });

  it('is refused to an actor who does not hold the permission application.review-refusal', async () => {
    const { commandBus } = arrange();
    const command = new ReviewProposedRefusalCommand(anActor().build(), APPLICATION_ID, confirmation);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());

  const handler = new ReviewProposedRefusalHandler(creditApplicationRepository, clock);

  commandBus.use(holders).register(ReviewProposedRefusalCommand, handler);

  return { commandBus, creditApplicationRepository };
}

/** An application assessed with the outcome given, by the person given. */
async function assessedApplication(
  repository: FakeCreditApplicationRepository,
  proposedOutcome: ProposedOutcome,
  assessorId: string,
): Promise<void> {
  const application = CreditApplication.create(APPLICATION_ID, 'applicant-1', {
    amount: Money.ofCents(1_234_567),
    durationMonths: 60,
    registeredAt,
    branchId: '',
  });

  application.assess(assessmentWith(proposedOutcome), assessedAt, assessorId);
  await repository.save(application);
}

function assessmentWith(proposedOutcome: ProposedOutcome): AssessmentRecord {
  return {
    modelVersion: '2026.1',
    debtToIncomePercent: 36,
    repaymentIncidents: proposedOutcome === 'refuse' ? 1 : 0,
    residualIncomeCents: 160_000,
    score: 85,
    band: 'green',
    factors: [],
    proposedOutcome,
  };
}

async function stateOf(repository: FakeCreditApplicationRepository): Promise<CreditApplicationState | undefined> {
  return (await repository.findById(APPLICATION_ID))?.toState();
}
