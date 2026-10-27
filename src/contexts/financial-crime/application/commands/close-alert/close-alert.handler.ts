import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { AlertRepository } from '@/contexts/financial-crime/domain/repositories/alert.repository';
import { UnknownAlert } from '@/contexts/financial-crime/domain/errors/unknown-alert.error';
import type { CloseAlertCommand } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.command';

export class CloseAlertHandler implements CommandHandler<CloseAlertCommand> {
  constructor(
    private readonly alertRepository: AlertRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: CloseAlertCommand): Promise<string> {
    const alert = await this.alertRepository.findById(command.alertId);

    if (alert === undefined) {
      throw UnknownAlert.forAlert();
    }

    alert.close(command.reason, this.clock.now());

    await this.alertRepository.save(alert);

    return alert.id;
  }
}
