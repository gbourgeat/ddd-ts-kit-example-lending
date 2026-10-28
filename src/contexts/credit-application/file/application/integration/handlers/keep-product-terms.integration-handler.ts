import { stampOf, systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { productDefinedV2, type ProductDefinedV2 } from '@/contexts/credit-policy/published-language';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { productTermsRowOf } from '@/contexts/credit-application/file/application/projections/product-terms-row-of.projection';

// ddd-ts-kit-disable-next-line events/consumer-idempotent -- ADR-0005: registered in its module file, which the rule does not read
export class KeepProductTermsIntegrationHandler {
  static readonly eventType = productDefinedV2.type;

  readonly actor = systemActor('credit-application.keep-product-terms');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: ProductDefinedV2): Promise<void> {
    await this.commands.execute(
      new KeepProductTermsCommand(this.actor, productTermsRowOf(event.payload), stampOf(event)),
    );
  }
}
