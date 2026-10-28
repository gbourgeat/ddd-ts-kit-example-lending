import { describe, expect, it } from '@jest/globals';
import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import { GetSuspiciousActivityReportHandler } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.handler';
import { GetSuspiciousActivityReportQuery } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.query';
import { FakeGetSuspiciousActivityReportReader } from '@/contexts/financial-crime/test/fakes/get-suspicious-activity-report-reader.fake';

const authorizer = new RoleBasedAuthorizer({
  roles: { complianceOfficer: [financialCrimePermissions['report.read']] },
});

const holders = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(requires(GetSuspiciousActivityReportQuery, financialCrimePermissions['report.read'])),
});

const complianceOfficer = anActor().withRole('complianceOfficer').build();

describe('Get suspicious activity report', () => {
  it('shows a filed report to a compliance officer', async () => {
    const queryBus = arrange(['report-1']);

    const shown = await queryBus.execute(new GetSuspiciousActivityReportQuery(complianceOfficer, 'report-1'));

    expect(shown).toEqual({ id: 'report-1' });
  });

  it('refuses to show a report that is not in the read model, with the code UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT', async () => {
    const queryBus = arrange(['report-1']);

    const query = new GetSuspiciousActivityReportQuery(complianceOfficer, 'report-404');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT' });
  });

  it('is refused to an actor who does not hold the permission report.read', async () => {
    const queryBus = arrange(['report-1']);
    const query = new GetSuspiciousActivityReportQuery(anActor().build(), 'report-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(reports: readonly string[]) {
  const { queryBus } = createTestBuses();
  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new GetSuspiciousActivityReportHandler(new FakeGetSuspiciousActivityReportReader(reports), access);

  return queryBus.use(holders).register(GetSuspiciousActivityReportQuery, handler);
}
