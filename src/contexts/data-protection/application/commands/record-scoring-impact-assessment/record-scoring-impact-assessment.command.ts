import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Records the impact assessment of a scoring model version for a month, by staff: the first record of the pair is kept. Answers its identifier. */
export class RecordScoringImpactAssessmentCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly scoringModelVersion: string,
    readonly month: string,
  ) {
    super(actor);
  }
}
