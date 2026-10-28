import { ReadModelStore } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRiskRow } from '@/contexts/reporting/application/read-model/portfolio-at-risk.row';

/** The arrears bucket of each loan, one line per tenant and loan, kept by the projection from what servicing announces. */
export abstract class PortfolioAtRisk extends ReadModelStore<PortfolioAtRiskRow> {}
