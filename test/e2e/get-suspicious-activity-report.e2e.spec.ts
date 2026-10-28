import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { complianceOfficer, filedReport, raisedAlert } from '$test/e2e/support/financial-crime/alert-world';

describe('Get suspicious activity report, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/suspicious-activity-reports/id-1');

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.get('/suspicious-activity-reports/id-1');

    expectStatus(response, 403);
  });

  it('shows a filed report to the compliance officer who files it', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');
    const reportId = await filedReport(ada, 'alert-1');

    const response = expectStatus(await ada.get(`/suspicious-activity-reports/${reportId}`), 200);

    expect(response.body).toMatchObject({ id: reportId });
  });

  it('publishes no integration event when a report is read', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');
    const reportId = await filedReport(ada, 'alert-1');

    await application.settled();
    const recorder = collectEvents(application.events, ['financial-crime.suspicious-activity-report.filed']);

    expectStatus(await ada.get(`/suspicious-activity-reports/${reportId}`), 200);

    await application.settled();
    recorder.stop();

    expect(recorder.received('financial-crime.suspicious-activity-report.filed')).toHaveLength(0);
  });

  it('refuses an unknown report to a compliance officer, with the code UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT', async () => {
    const ada = await complianceOfficer(application, 'ada');

    const response = await ada.get('/suspicious-activity-reports/report-404');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT' });
  });
});
