import { describe, expect, it } from '@jest/globals';
import type { ScoringGateway } from '@/contexts/credit-application/assessment/application/ports/scoring-gateway.port';
import { InProcessScoringGateway } from '@/contexts/credit-application/assessment/infrastructure/external/in-process-scoring.gateway';
import { FakeScoringGateway } from '@/contexts/credit-application/test/fakes/scoring-gateway.fake';

const INPUTS = { debtToIncomePercent: 30, repaymentIncidents: 0, residualIncomeCents: 90_000 };
const SCORED = { score: 720, band: 'green', modelVersion: '2026.1', factors: [] };

const ADAPTERS: readonly (readonly [string, (answer: typeof SCORED | undefined) => ScoringGateway])[] = [
  [
    'the fake',
    (answer) => {
      const fake = new FakeScoringGateway();

      fake.answers(answer);

      return fake;
    },
  ],
  ['the in-process adapter', (answer) => new InProcessScoringGateway({ scoreOf: async () => answer })],
];

describe.each(ADAPTERS)('ScoringGateway, %s', (_name, create) => {
  it('answers what credit-scoring publishes, in the types of credit-application', async () => {
    expect(await create(SCORED).scoreOf(INPUTS)).toEqual(SCORED);
  });

  it('answers nothing, without failing, when no model version is published', async () => {
    expect(await create(undefined).scoreOf(INPUTS)).toBeUndefined();
  });
});
