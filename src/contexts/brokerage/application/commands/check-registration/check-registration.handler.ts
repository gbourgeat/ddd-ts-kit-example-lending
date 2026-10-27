import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';
import type { BrokerRepository } from '@/contexts/brokerage/domain/repositories/broker.repository';
import type { IntermediariesRegister } from '@/contexts/brokerage/application/ports/intermediaries-register.port';
import type { CheckRegistrationCommand } from '@/contexts/brokerage/application/commands/check-registration/check-registration.command';

export class CheckRegistrationHandler implements CommandHandler<CheckRegistrationCommand> {
  constructor(
    private readonly brokerRepository: BrokerRepository,
    private readonly intermediaries: IntermediariesRegister,
  ) {}

  async execute(command: CheckRegistrationCommand): Promise<number> {
    let lapsed = 0;

    for (const broker of await this.brokerRepository.findNotLapsed()) {
      if (await this.lapseIfInvalid(broker, command.day)) {
        lapsed += 1;
      }
    }

    return lapsed;
  }

  private async lapseIfInvalid(broker: Broker, day: Date): Promise<boolean> {
    const valid = await this.intermediaries.isValidOn(broker.registrationNumber, day);

    if (valid) {
      return false;
    }

    broker.markLapsed(day);
    await this.brokerRepository.save(broker);

    return true;
  }
}
