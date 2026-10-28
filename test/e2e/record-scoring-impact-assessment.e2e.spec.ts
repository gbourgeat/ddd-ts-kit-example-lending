import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const assessment = { scoringModelVersion: '2026.2', month: '2026-05' };

describe('Record scoring impact assessment, end to end', () => {
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
    const response = await application.client.post('/impact-assessments', assessment);

    expectStatus(response, 401);
  });

  it('answers 403 with FORBIDDEN to an actor who does not hold the permission impact-assessment.record', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/impact-assessments', assessment);

    expectStatus(response, 403);
    expect(response.body).toMatchObject({ code: 'FORBIDDEN' });
  });

  it('answers 201 with the identifier of the record to a staff member', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId: 'acme-bank' });

    const response = await ada.post('/impact-assessments', assessment);

    expectStatus(response, 201);
    expect(response.body).toEqual({ id: '2026.2:2026-05' });
  });

  it('records one assessment per month for the same version', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId: 'acme-bank' });

    expectStatus(await ada.post('/impact-assessments', assessment), 201);

    const response = await ada.post('/impact-assessments', { ...assessment, month: '2026-06' });

    expectStatus(response, 201);
  });

  it('answers 422 with IMPACT_ASSESSMENT_ALREADY_RECORDED to a second record of the same version and month', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId: 'acme-bank' });

    expectStatus(await ada.post('/impact-assessments', assessment), 201);

    const response = await ada.post('/impact-assessments', assessment);

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'IMPACT_ASSESSMENT_ALREADY_RECORDED' });
  });

  it('answers 422 with INVALID_YEAR_MONTH to a month that is not written YYYY-MM', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId: 'acme-bank' });

    const response = await ada.post('/impact-assessments', { ...assessment, month: '2026-13' });

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'INVALID_YEAR_MONTH' });
  });
});
