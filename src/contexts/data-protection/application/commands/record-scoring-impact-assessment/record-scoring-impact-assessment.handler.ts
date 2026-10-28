import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';
import { ImpactAssessmentAlreadyRecorded } from '@/contexts/data-protection/domain/errors/impact-assessment-already-recorded.error';
import type { ImpactAssessmentRepository } from '@/contexts/data-protection/domain/repositories/impact-assessment.repository';
import type { RecordScoringImpactAssessmentCommand } from '@/contexts/data-protection/application/commands/record-scoring-impact-assessment/record-scoring-impact-assessment.command';

/** One record per scoring model version and per month: a second one is refused, the first is never amended. */
export class RecordScoringImpactAssessmentHandler implements CommandHandler<RecordScoringImpactAssessmentCommand> {
  constructor(
    private readonly impactAssessmentRepository: ImpactAssessmentRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: RecordScoringImpactAssessmentCommand): Promise<string> {
    const id = ImpactAssessment.identifierOf(command.scoringModelVersion, command.month);

    if ((await this.impactAssessmentRepository.findById(id)) !== undefined) {
      throw ImpactAssessmentAlreadyRecorded.forVersionAndMonth(command.scoringModelVersion, command.month);
    }

    const impactAssessment = ImpactAssessment.create(id, command.scoringModelVersion, command.month, this.clock.now());

    await this.impactAssessmentRepository.save(impactAssessment);

    return impactAssessment.id;
  }
}
