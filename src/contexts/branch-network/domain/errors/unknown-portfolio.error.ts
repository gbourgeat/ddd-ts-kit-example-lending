import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BranchNetworkCodes } from '@/contexts/branch-network/branch-network.codes';

export class UnknownPortfolio extends DomainRefusal {
  readonly code = BranchNetworkCodes.UnknownPortfolio;

  static forAdvisor(advisorId: string) {
    return UnknownPortfolio.refusal('No portfolio of the branch network is held by this advisor.', { advisorId });
  }

  static forPortfolio(portfolioId: string) {
    return UnknownPortfolio.refusal('No portfolio of the branch network has this identifier.', { portfolioId });
  }
}
