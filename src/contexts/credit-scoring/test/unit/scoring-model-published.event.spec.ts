import { describe, expect, it } from '@jest/globals';
import { ScoringModelPublished } from '@/contexts/credit-scoring/domain/events/scoring-model-published.event';

describe('ScoringModelPublished', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new ScoringModelPublished(
      'scoring-model-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'version-1',
      1,
      'low',
      '2026.1',
    );

    expect(event.name).toBe('credit-scoring.scoring-model.published');
    expect(event.aggregateId).toBe('scoring-model-1');
    expect(event.label).toBe('2026.1');
  });
});
