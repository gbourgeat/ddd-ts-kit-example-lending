import type { ScoringContract } from '@/contexts/credit-scoring/published-language';
import type { ScoringGateway } from '@/contexts/credit-application/assessment/application/ports/scoring-gateway.port';

// TODO(platform): when credit-scoring runs as its own service, write the remote adapter of ScoringGateway next to this one (an HTTP or RPC client with a timeout, retries and a fallback) and bind it instead; nothing else changes.
export class InProcessScoringGateway implements ScoringGateway {
  constructor(readonly upstream: ScoringContract) {}

  scoreOf(inputs: {
    debtToIncomePercent: number;
    repaymentIncidents: number;
    residualIncomeCents: number;
  }): Promise<{ score: number; band: string; modelVersion: string; factors: string[] } | undefined> {
    return this.upstream.scoreOf(inputs);
  }
}
