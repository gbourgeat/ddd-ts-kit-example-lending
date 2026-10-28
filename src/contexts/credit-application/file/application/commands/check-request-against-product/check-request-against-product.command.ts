import { Command } from '@ddd-ts-kit/kernel';

/** The check of a submitted application against the limits of its product: the application is the only input. */
export class CheckRequestAgainstProductCommand extends Command<string> {
  constructor(readonly applicationId: string) {
    super();
  }
}
