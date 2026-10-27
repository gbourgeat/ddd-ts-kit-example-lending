import { describe, expect, it } from '@jest/globals';
import { SuspiciousActivityReportFiled } from '@/contexts/financial-crime/domain/events/suspicious-activity-report-filed.event';

describe('SuspiciousActivityReportFiled', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new SuspiciousActivityReportFiled(
      'suspicious-activity-report-1',
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(event.name).toBe('financial-crime.suspicious-activity-report.filed');
    expect(event.aggregateId).toBe('suspicious-activity-report-1');
  });
});
