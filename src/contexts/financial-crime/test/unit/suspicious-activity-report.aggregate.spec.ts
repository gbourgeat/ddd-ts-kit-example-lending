import { describe, expect, it } from '@jest/globals';
import { SuspiciousActivityReportFiled } from '@/contexts/financial-crime/domain/events/suspicious-activity-report-filed.event';
import { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';
import { aSuspiciousActivityReport } from '@/contexts/financial-crime/test/builders/suspicious-activity-report.builder';

describe('SuspiciousActivityReport', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aSuspiciousActivityReport().identifiedBy('suspicious-activity-report-7').bornAt(bornAt).build();

    expect(born.id).toBe('suspicious-activity-report-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('is born pending, with no filing reference, and records no fact while it waits', () => {
    const pending = aSuspiciousActivityReport().build();

    expect(pending.filingReference).toBeUndefined();
    expect(pending.pullEvents()).toEqual([]);
  });

  it('records the fact that it is filed once the financial intelligence unit gives its reference', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const filed = aSuspiciousActivityReport()
      .identifiedBy('suspicious-activity-report-7')
      .bornAt(bornAt)
      .filedAs('FIU-7')
      .build();

    expect(filed.filingReference).toBe('FIU-7');
    expect(filed.pullEvents()).toEqual([new SuspiciousActivityReportFiled('suspicious-activity-report-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aSuspiciousActivityReport().filedAs('FIU-3').build();

    const loaded = SuspiciousActivityReport.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('aSuspiciousActivityReport exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aSuspiciousActivityReport().build();

    expect(built.subjectReference).toEqual('loan-1');
  });
});
