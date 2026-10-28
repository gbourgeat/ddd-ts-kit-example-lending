import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: ErasePersonalDataPastRetentionCommand): Promise<string> {
    // TODO(domain): decide what "erase personal data past retention" does to a CreditApplication: either it gives birth to one (keep `create`, pass the facts of `command` as value objects), or it changes an existing one (load it with `findById`, throw its refusal when there is none, `UnknownCreditApplication.forCreditApplication(id)` (`ddd-ts-kit generate error credit-application UnknownCreditApplication forCreditApplication`), call ONE intention method). The events it records leave with the save: nothing else to do here.
    const creditApplication = CreditApplication.create(this.ids.next(), this.clock.now());

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }
}
