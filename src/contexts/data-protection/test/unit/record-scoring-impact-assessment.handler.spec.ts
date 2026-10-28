import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { RecordScoringImpactAssessmentCommand } from '@/contexts/data-protection/application/commands/record-scoring-impact-assessment/record-scoring-impact-assessment.command';
import { RecordScoringImpactAssessmentHandler } from '@/contexts/data-protection/application/commands/record-scoring-impact-assessment/record-scoring-impact-assessment.handler';
import { FakeImpactAssessmentRepository } from '@/contexts/data-protection/test/fakes/impact-assessment.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [dataProtectionPermissions['impact-assessment.record']] },
  }),
  map: AuthorizationMap.of(
    requires(RecordScoringImpactAssessmentCommand, dataProtectionPermissions['impact-assessment.record']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Record scoring impact assessment', () => {
  it('records the assessment of the version for the month and answers its identifier', async () => {
    const { commandBus, impactAssessmentRepository } = arrange();

    const id = await commandBus.execute(new RecordScoringImpactAssessmentCommand(holder, '2026.2', '2026-05'));

    expect(id).toBe('2026.2:2026-05');
    expect((await impactAssessmentRepository.findById(id))?.month).toBe('2026-05');
  });

  it('records one assessment per month for the same version', async () => {
    const { commandBus } = arrange();

    await commandBus.execute(new RecordScoringImpactAssessmentCommand(holder, '2026.2', '2026-05'));
    const id = await commandBus.execute(new RecordScoringImpactAssessmentCommand(holder, '2026.2', '2026-06'));

    expect(id).toBe('2026.2:2026-06');
  });

  it('refuses a second record of the same version and month, and keeps the first', async () => {
    const { commandBus, impactAssessmentRepository } = arrange();
    const first = await commandBus.execute(new RecordScoringImpactAssessmentCommand(holder, '2026.2', '2026-05'));
    const before = await impactAssessmentRepository.findById(first);

    const second = commandBus.execute(new RecordScoringImpactAssessmentCommand(holder, '2026.2', '2026-05'));

    await expect(second).rejects.toMatchObject({ code: 'IMPACT_ASSESSMENT_ALREADY_RECORDED' });
    expect(await impactAssessmentRepository.findById(first)).toEqual(before);
  });

  it('refuses a month that is not written YYYY-MM with INVALID_YEAR_MONTH, and saves nothing', async () => {
    const { commandBus, impactAssessmentRepository } = arrange();

    const recorded = commandBus.execute(new RecordScoringImpactAssessmentCommand(holder, '2026.2', '2026-13'));

    await expect(recorded).rejects.toMatchObject({ code: 'INVALID_YEAR_MONTH' });
    expect(await impactAssessmentRepository.findById('2026.2:2026-13')).toBeUndefined();
  });

  it('refuses a blank scoring model version with INVALID_SCORING_MODEL_VERSION, and saves nothing', async () => {
    const { commandBus, impactAssessmentRepository } = arrange();

    const recorded = commandBus.execute(new RecordScoringImpactAssessmentCommand(holder, ' ', '2026-05'));

    await expect(recorded).rejects.toMatchObject({ code: 'INVALID_SCORING_MODEL_VERSION' });
    expect(await impactAssessmentRepository.findById(':2026-05')).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission impact-assessment.record', async () => {
    const { commandBus } = arrange();
    const command = new RecordScoringImpactAssessmentCommand(anActor().build(), '2026.2', '2026-05');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'impact-assessment' });
  const impactAssessmentRepository = dispatching(new FakeImpactAssessmentRepository());

  const handler = new RecordScoringImpactAssessmentHandler(impactAssessmentRepository, clock);

  commandBus.use(holders).register(RecordScoringImpactAssessmentCommand, handler);

  return { commandBus, impactAssessmentRepository };
}
