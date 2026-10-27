import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import type { PortfolioRepository } from '@/contexts/branch-network/domain/repositories/portfolio.repository';
import type { OpenPortfolioCommand } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.command';

export class OpenPortfolioHandler implements CommandHandler<OpenPortfolioCommand> {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: OpenPortfolioCommand): Promise<string> {
    const portfolio = Portfolio.create(this.ids.next(), command.advisorId, command.branchId, this.clock.now());

    await this.portfolioRepository.save(portfolio);

    return portfolio.id;
  }
}
