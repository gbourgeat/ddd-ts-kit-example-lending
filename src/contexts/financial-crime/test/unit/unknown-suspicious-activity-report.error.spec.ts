import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownSuspiciousActivityReport } from '@/contexts/financial-crime/domain/errors/unknown-suspicious-activity-report.error';

describe('UnknownSuspiciousActivityReport', () => {
  it('refuses for report with the code UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT', () => {
    const error = UnknownSuspiciousActivityReport.forReport();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT');
    expect(error.message).toBe('Unknown suspicious activity report.');
    expect(error.facts).toEqual({});
  });
});
