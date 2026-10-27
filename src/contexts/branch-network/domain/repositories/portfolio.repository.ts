import { Repository } from '@ddd-ts-kit/kernel';
import type { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';

export abstract class PortfolioRepository extends Repository<Portfolio> {}
