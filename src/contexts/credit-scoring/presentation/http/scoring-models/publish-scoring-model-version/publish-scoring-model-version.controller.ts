import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditScoringCodes } from '@/contexts/credit-scoring/credit-scoring.codes';
import { PublishScoringModelVersionCommand } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.command';
import { ScoringModelsRoutes } from '@/contexts/credit-scoring/presentation/http/scoring-models.routes';
import { PublishScoringModelVersionBody } from '@/contexts/credit-scoring/presentation/http/scoring-models/publish-scoring-model-version/publish-scoring-model-version.body';
import { PublishedScoringModelVersion } from '@/contexts/credit-scoring/presentation/http/scoring-models/publish-scoring-model-version/published-scoring-model-version.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ScoringModelsRoutes })
export class PublishScoringModelVersionController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @HttpCode(201)
  @KitRoute({
    errors: [CreditScoringCodes.ScoringModelLabelRequired],
  })
  async publishScoringModelVersion(
    @Body() body: PublishScoringModelVersionBody,
    @CurrentActor() actor: Actor,
  ): Promise<PublishedScoringModelVersion> {
    const version = await this.commands.execute(
      new PublishScoringModelVersionCommand(actor, body.modelRisk, body.label),
    );

    return { id: version.id, number: version.number, modelRisk: version.modelRisk, label: version.label };
  }
}
