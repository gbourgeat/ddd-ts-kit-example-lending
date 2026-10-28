import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import type { ScoringModelVersion } from '@/contexts/credit-scoring/domain/entities/scoring-model-version.entity';
import type { ScoringModelRepository } from '@/contexts/credit-scoring/domain/repositories/scoring-model.repository';
import type { PublishScoringModelVersionCommand } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.command';

export class PublishScoringModelVersionHandler implements CommandHandler<PublishScoringModelVersionCommand> {
  constructor(
    private readonly scoringModelRepository: ScoringModelRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: PublishScoringModelVersionCommand): Promise<ScoringModelVersion> {
    const scoringModel =
      (await this.scoringModelRepository.findById(ScoringModel.BANK_ID)) ??
      ScoringModel.create(ScoringModel.BANK_ID, this.clock.now());

    const version = scoringModel.publish(this.ids.next(), command.modelRisk, command.label, this.clock.now());

    await this.scoringModelRepository.save(scoringModel);

    return version;
  }
}
