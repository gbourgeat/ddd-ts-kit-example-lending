import type { Access } from '@ddd-ts-kit/auth';
import type { Clock, CommandHandler, SignedUrl } from '@ddd-ts-kit/kernel';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import type { CopyOfDataStore } from '@/contexts/data-protection/application/ports/copy-of-data-store.port';
import type { RequestPersonalDataCopyLinkCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy-link/request-personal-data-copy-link.command';
import { UnknownPersonalDataCopy } from '@/contexts/data-protection/domain/errors/unknown-personal-data-copy.error';

/** How long a copy of the data of a data subject is kept: seven days, then it is deleted. */
const COPY_OF_DATA_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Answers a fresh one-hour link to a copy still kept. A copy past its seven days is deleted, and
 * answered as unknown, as is a copy that was never made.
 */
export class RequestPersonalDataCopyLinkHandler implements CommandHandler<RequestPersonalDataCopyLinkCommand> {
  constructor(
    private readonly access: Access,
    private readonly copies: CopyOfDataStore,
    private readonly clock: Clock,
  ) {}

  async execute(command: RequestPersonalDataCopyLinkCommand): Promise<SignedUrl> {
    await this.authorize(command);

    const storedAt = await this.copies.storedAt(command.customerId, command.copyId);

    if (storedAt === undefined) {
      throw UnknownPersonalDataCopy.forUnknownPersonalDataCopy();
    }

    if (this.clock.now().getTime() - storedAt.getTime() >= COPY_OF_DATA_RETENTION_MS) {
      await this.copies.remove(command.customerId, command.copyId);

      throw UnknownPersonalDataCopy.forUnknownPersonalDataCopy();
    }

    return this.copies.link(command.customerId, command.copyId);
  }

  /** The customer's self, or an operator of data-protection, holds the permission: the self is asked first. */
  private async authorize(command: RequestPersonalDataCopyLinkCommand): Promise<void> {
    const permission = dataProtectionPermissions['data-subject.request-copy'];
    const decision = await this.access.decide(command.actor, permission, { type: 'customer', id: command.customerId });

    if (decision.allowed) {
      return;
    }

    await this.access.authorize(command.actor, permission, { type: 'context', id: 'data-protection' });
  }
}
