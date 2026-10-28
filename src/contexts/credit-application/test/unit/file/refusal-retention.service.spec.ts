import { describe, expect, it } from '@jest/globals';
import { RefusalRetentionService } from '@/contexts/credit-application/file/domain/services/refusal-retention.service';

const cutoff = new Date('2026-02-01T00:00:00.000Z');
const refusal = { outcome: 'refuse', deciderId: 'd', approvedAmountCents: 0 } as const;

describe('RefusalRetentionService', () => {
  it('is past retention once the refusal is on or before the cutoff', () => {
    const decision = { ...refusal, decidedAt: cutoff };

    expect(new RefusalRetentionService().isPastRetention({ decision }, cutoff)).toBe(true);
  });

  it('is not past retention while the refusal is after the cutoff', () => {
    const decision = { ...refusal, decidedAt: new Date('2026-02-02T00:00:00.000Z') };

    expect(new RefusalRetentionService().isPastRetention({ decision }, cutoff)).toBe(false);
  });

  it('is never past retention for an approval or an application not decided', () => {
    const approval = { ...refusal, outcome: 'approve', decidedAt: new Date('2020-01-01T00:00:00.000Z') } as const;

    expect(new RefusalRetentionService().isPastRetention({ decision: approval }, cutoff)).toBe(false);
    expect(new RefusalRetentionService().isPastRetention({ decision: undefined }, cutoff)).toBe(false);
  });
});
