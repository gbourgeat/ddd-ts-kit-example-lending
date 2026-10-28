import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import type { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';

/** Writes the terms of the command into the read model, unless the read model holds a later event. */
export class KeepProductTermsHandler implements CommandHandler<KeepProductTermsCommand> {
  constructor(private readonly productTerms: ProductTerms) {}

  async execute(command: KeepProductTermsCommand): Promise<void> {
    const { row, stamp } = command;

    await this.productTerms.upsertIfNewer(row.productId, stamp, () => row);
  }
}
