import { describe, expect, it } from '@jest/globals';
import { TableInForce } from '@/contexts/credit-application/decision/domain/services/table-in-force.service';

const march = { delegationTableId: 'march', effectiveFrom: new Date('2026-03-01T00:00:00.000Z') };
const september = { delegationTableId: 'september', effectiveFrom: new Date('2026-09-01T00:00:00.000Z') };

describe('TableInForce', () => {
  it('takes the table of the latest date of effect not after the day', () => {
    const day = new Date('2026-10-28T00:00:00.000Z');

    expect(new TableInForce().of([september, march], day)).toBe(september);
  });

  it('ignores a table that takes effect after the day', () => {
    const day = new Date('2026-05-01T00:00:00.000Z');

    expect(new TableInForce().of([september, march], day)).toBe(march);
  });

  it('has no table in force before the first date of effect', () => {
    expect(new TableInForce().of([march], new Date('2026-01-01T00:00:00.000Z'))).toBeUndefined();
  });
});
