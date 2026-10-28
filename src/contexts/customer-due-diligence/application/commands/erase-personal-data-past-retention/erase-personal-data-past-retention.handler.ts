import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: ErasePersonalDataPastRetentionCommand): Promise<string> {
    // TODO(domain): decide what "erase personal data past retention" does to a Customer: either it gives birth to one (keep `create`, pass the facts of `command` as value objects), or it changes an existing one (load it with `findById`, throw its refusal when there is none, `UnknownCustomer.forCustomer(id)` (`ddd-ts-kit generate error customer-due-diligence UnknownCustomer forCustomer`), call ONE intention method). The events it records leave with the save: nothing else to do here.
    const customer = Customer.create(this.ids.next(), this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
