import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Files a suspicious activity report about an alert with the financial intelligence unit, or keeps it pending while the unit is down. */
export class FileSuspiciousActivityReportCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly alertId: string,
  ) {
    super(actor);
  }
}
