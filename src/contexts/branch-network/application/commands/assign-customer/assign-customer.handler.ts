import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { UnknownPortfolio } from '@/contexts/branch-network/domain/errors/unknown-portfolio.error';
import type { PortfolioRepository } from '@/contexts/branch-network/domain/repositories/portfolio.repository';
import type { AssignCustomerCommand } from '@/contexts/branch-network/application/commands/assign-customer/assign-customer.command';

export class AssignCustomerHandler implements CommandHandler<AssignCustomerCommand> {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly relations: RelationTupleStore,
  ) {}

  async execute(command: AssignCustomerCommand): Promise<string> {
    const portfolio = await this.portfolioRepository.findByAdvisor(command.advisorId);

    if (!portfolio) {
      throw UnknownPortfolio.forAdvisor(command.advisorId);
    }

    // The membership is a relation written in the change: writing it twice leaves one tuple. The customer
    // also names its portfolio, so that the advisor of the portfolio is reached from the customer (the
    // customer rules of the relationship schema, `via('portfolio', 'advisor')`).
    await this.relations.write([
      { object: `portfolio:${portfolio.id}`, relation: 'member', subject: `customer:${command.customerId}` },
      { object: `customer:${command.customerId}`, relation: 'portfolio', subject: `portfolio:${portfolio.id}` },
    ]);

    return portfolio.id;
  }
}
