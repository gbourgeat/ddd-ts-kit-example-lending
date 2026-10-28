import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';

export class RequestExceptionHandler implements CommandHandler<RequestExceptionCommand> {
  constructor(private readonly creditApplicationRepository: CreditApplicationRepository) {}

  async execute(command: RequestExceptionCommand): Promise<void> {
    // TODO(domain): "request exception" changes CreditApplications that exist and writes nothing until you decide how: load the one `command` names with `this.creditApplicationRepository.findById`, throw its refusal when there is none, `UnknownCreditApplication.forCreditApplication(id)` (`ddd-ts-kit generate error credit-application UnknownCreditApplication forCreditApplication`), call ONE intention method of the aggregate, then `save` it (its events leave with the save). A command that gives birth to one is generated with `--creates`; its handler calls `CreditApplication.create` with the facts of `command` as value objects.
  }
}
