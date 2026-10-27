import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

export class PublishRateGridCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly productId: string,
    readonly effectiveFrom: Date,
  ) {
    super(actor);
  }
}
