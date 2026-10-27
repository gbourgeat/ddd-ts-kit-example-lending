import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';
import { InvalidBrokerRegistration } from '@/contexts/brokerage/domain/errors/invalid-broker-registration.error';
import type { BrokerRepository } from '@/contexts/brokerage/domain/repositories/broker.repository';
import type { IntermediariesRegister } from '@/contexts/brokerage/application/ports/intermediaries-register.port';
import type { RegisterBrokerCommand } from '@/contexts/brokerage/application/commands/register-broker/register-broker.command';

export class RegisterBrokerHandler implements CommandHandler<RegisterBrokerCommand> {
  constructor(
    private readonly brokerRepository: BrokerRepository,
    private readonly intermediaries: IntermediariesRegister,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: RegisterBrokerCommand): Promise<string> {
    const now = this.clock.now();
    const valid = await this.intermediaries.isValidOn(command.registrationNumber, now);

    if (!valid) {
      throw InvalidBrokerRegistration.forRegistration(command.registrationNumber);
    }

    const broker = Broker.create(this.ids.next(), command.registrationNumber, now);

    await this.brokerRepository.save(broker);

    return broker.id;
  }
}
