import type { Access } from '@ddd-ts-kit/auth';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import type { PersonalDataGathering } from '@/contexts/data-protection/application/ports/personal-data-gathering.port';
import type { CopyOfDataStore } from '@/contexts/data-protection/application/ports/copy-of-data-store.port';
import type { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import type { IssuedPersonalDataCopy } from '@/contexts/data-protection/application/commands/request-personal-data-copy/issued-personal-data-copy.result';

/**
 * Gathers what every context keeps of the data subject, stores the copy and answers its identifier
 * with the link that downloads it. Nothing is written to the database: the copy lives in the object
 * store for seven days.
 */
export class RequestPersonalDataCopyHandler implements CommandHandler<RequestPersonalDataCopyCommand> {
  constructor(
    private readonly access: Access,
    private readonly gathering: PersonalDataGathering,
    private readonly copies: CopyOfDataStore,
  ) {}

  async execute(command: RequestPersonalDataCopyCommand): Promise<IssuedPersonalDataCopy> {
    await this.authorize(command);

    const document = await this.gathering.gather(command.customerId, command.actor.id);
    const copyId = await this.copies.store(command.customerId, document);

    return { copyId, link: await this.copies.link(command.customerId, copyId) };
  }

  /**
   * The customer's self, or an operator of data-protection, holds the permission: the self is asked
   * first on the customer, then the operator on the context. The refusal names the context question.
   */
  private async authorize(command: RequestPersonalDataCopyCommand): Promise<void> {
    const permission = dataProtectionPermissions['data-subject.request-copy'];
    const decision = await this.access.decide(command.actor, permission, { type: 'customer', id: command.customerId });

    if (decision.allowed) {
      return;
    }

    await this.access.authorize(command.actor, permission, { type: 'context', id: 'data-protection' });
  }
}
