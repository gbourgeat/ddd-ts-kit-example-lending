import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { RateGrid } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';
import type { RateGridRepository } from '@/contexts/credit-policy/domain/repositories/rate-grid.repository';
import type { PublishRateGridCommand } from '@/contexts/credit-policy/application/commands/publish-rate-grid/publish-rate-grid.command';

export class PublishRateGridHandler implements CommandHandler<PublishRateGridCommand> {
  constructor(
    private readonly rateGridRepository: RateGridRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: PublishRateGridCommand): Promise<string> {
    const rateGrid = RateGrid.create(
      this.ids.next(),
      { productId: command.productId, effectiveFrom: command.effectiveFrom, rates: command.rates },
      this.clock.now(),
    );

    await this.rateGridRepository.save(rateGrid);

    return rateGrid.id;
  }
}
