import type { ScoringGateway } from '@/contexts/credit-application/assessment/application/ports/scoring-gateway.port';

type Scored = { score: number; band: string; modelVersion: string; factors: string[] };

export class FakeScoringGateway implements ScoringGateway {
  private answer: Scored | undefined;

  /** What credit-scoring answers to every applicant, until a test says otherwise; nothing by default. */
  answers(answer: Scored | undefined): void {
    this.answer = answer;
  }

  async scoreOf(): Promise<Scored | undefined> {
    return this.answer;
  }
}
