import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { PortfolioRepository } from '@/contexts/branch-network/domain/repositories/portfolio.repository';
import type { CustomerAdvisorBranchContract } from '@/contexts/branch-network/published-language/customer-advisor-branch.contract';

const CUSTOMER_PREFIX = 'customer:';
const PORTFOLIO_PREFIX = 'portfolio:';

/**
 * Answers the branch of the advisor whose portfolio holds the customer. The membership is a relation of the portfolio,
 * written when the customer joins it, so the answer reads the portfolios the customer is a member of.
 */
export class CustomerAdvisorBranchAnswer implements CustomerAdvisorBranchContract {
  constructor(
    private readonly relations: RelationTupleStore,
    private readonly portfolios: PortfolioRepository,
  ) {}

  async branchOfCustomerAdvisor(customerId: string): Promise<string | undefined> {
    const tuples = await this.relations.readBySubject(`${CUSTOMER_PREFIX}${customerId}`);
    const membership = tuples.find((tuple) => tuple.relation === 'member' && tuple.object.startsWith(PORTFOLIO_PREFIX));

    if (!membership) {
      return undefined;
    }

    const portfolio = await this.portfolios.findById(membership.object.slice(PORTFOLIO_PREFIX.length));

    return portfolio?.branchId;
  }
}
