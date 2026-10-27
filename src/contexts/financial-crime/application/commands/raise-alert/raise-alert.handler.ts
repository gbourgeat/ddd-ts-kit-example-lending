import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';
import type { AlertRepository } from '@/contexts/financial-crime/domain/repositories/alert.repository';
import { AlertRuleService } from '@/contexts/financial-crime/domain/services/alert-rule.service';
import type { RaiseAlertCommand } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.command';

export class RaiseAlertHandler implements CommandHandler<RaiseAlertCommand> {
  private readonly alertRules = new AlertRuleService();

  constructor(
    private readonly alertRepository: AlertRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  /** Answers the identifier of the alert raised, or nothing when the repayment raises no alert. */
  async execute(command: RaiseAlertCommand): Promise<string | undefined> {
    const decision = this.alertRules.evaluate(command.facts);

    if (!decision.raised) {
      return undefined;
    }

    const alert = Alert.create(this.ids.next(), command.repaymentReference, this.clock.now());

    await this.alertRepository.save(alert);

    return alert.id;
  }
}
