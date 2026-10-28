import { ReadModelStore } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRiskRow } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.row';

/** The principal and the arrears bucket of each loan, kept by the projection from the events of the loans in the event store. */
export abstract class PortfolioAtRisk extends ReadModelStore<PortfolioAtRiskRow> {}
