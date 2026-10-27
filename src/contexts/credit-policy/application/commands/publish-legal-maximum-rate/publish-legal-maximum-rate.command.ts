import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

export class PublishLegalMaximumRateCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly terms: {
      readonly category: string;
      readonly rateBasisPoints: number;
      readonly effectiveFrom: Date;
    },
  ) {
    super(actor);
  }
}
