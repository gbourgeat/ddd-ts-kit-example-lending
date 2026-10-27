import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Product } from '@/contexts/credit-policy/domain/aggregates/product.aggregate';
import type { ProductRepository } from '@/contexts/credit-policy/domain/repositories/product.repository';
import { AmountBounds } from '@/contexts/credit-policy/domain/value-objects/amount-bounds.vo';
import { ArrangementFee } from '@/contexts/credit-policy/domain/value-objects/arrangement-fee.vo';
import { DurationBounds } from '@/contexts/credit-policy/domain/value-objects/duration-bounds.vo';
import { ProductTerms } from '@/contexts/credit-policy/domain/value-objects/product-terms.vo';
import { ScoreThreshold } from '@/contexts/credit-policy/domain/value-objects/score-threshold.vo';
import type { DefineProductCommand } from '@/contexts/credit-policy/application/commands/define-product/define-product.command';

export class DefineProductHandler implements CommandHandler<DefineProductCommand> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: DefineProductCommand): Promise<string> {
    const { terms } = command;

    const product = Product.create(
      this.ids.next(),
      ProductTerms.create({
        amount: AmountBounds.create(terms.amountMinimumCents, terms.amountMaximumCents),
        duration: DurationBounds.create(terms.durationMinimumMonths, terms.durationMaximumMonths),
        arrangementFee: ArrangementFee.create(terms.arrangementFeeCents),
        insuranceMandatory: terms.insuranceMandatory,
        scoreThreshold: ScoreThreshold.create(terms.scoreThreshold),
      }),
      this.clock.now(),
    );

    await this.productRepository.save(product);

    return product.id;
  }
}
