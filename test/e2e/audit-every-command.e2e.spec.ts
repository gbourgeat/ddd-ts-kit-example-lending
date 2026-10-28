import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { branchOperatorOf } from '$test/e2e/support/branch-network/branch-operator';
import { openedBranchOf } from '$test/e2e/support/branch-network/opened-branch';
import { operatorOf as creditPolicyOperatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { operatorOf as creditScoringOperatorOf } from '$test/e2e/support/credit-scoring/operator-of';
import { operatorOf as dueDiligenceOperatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';
import { aPersonBody } from '$test/e2e/support/customer-due-diligence/customer-files';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { bankTenantId, complianceOfficer, raisedAlert } from '$test/e2e/support/financial-crime/alert-world';

describe('Every command of every context writes an audit entry, end to end', () => {
  let application: RunningApplication;
  let provider: { close: () => Promise<void> };

  beforeAll(async () => {
    provider = await startKeycloakStandIn();
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    await provider.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  const entriesOf = (action: string) =>
    application.persistence.database.client().auditEntry.findMany({ where: { action, category: 'command' } });

  it('audits OpenOrganisation of identity', async () => {
    await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'] });

    expectStatus(await ada.put('/accounts/me', {}), 200);
    expectStatus(await ada.post('/organisations', { slug: 'acme-bank', name: 'Acme Bank' }), 201);

    expect(await entriesOf('OpenOrganisationCommand')).toHaveLength(1);
  });

  it('audits AppointStaffMember of branch-network', async () => {
    const operator = await branchOperatorOf(application);
    const branchId = await openedBranchOf(operator);
    const advisor = { name: 'Grace Hopper', email: 'grace@example.test', accountId: 'grace', level: 'advisor' };

    expectStatus(await operator.post(`/branches/${branchId}/staff`, advisor), 201);

    expect(await entriesOf('AppointStaffMemberCommand')).toHaveLength(1);
  });

  it('audits RegisterBroker of brokerage', async () => {
    await application.relate({ object: 'context:brokerage', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', tenantId: bankTenantId });

    application.register.markValid('REG-0001');
    expectStatus(await ada.post('/brokers', { registrationNumber: 'REG-0001' }), 201);

    expect(await entriesOf('RegisterBrokerCommand')).toHaveLength(1);
  });

  it('audits PublishRateGrid of credit-policy', async () => {
    const ada = await creditPolicyOperatorOf(application, 'ada');

    expectStatus(await ada.post('/rate-grids', { productId: 'personal-loan', effectiveFrom: '2026-03-01' }), 201);

    expect(await entriesOf('PublishRateGridCommand')).toHaveLength(1);
  });

  it('audits PublishScoringModelVersion of credit-scoring', async () => {
    const olivia = await creditScoringOperatorOf(application, 'olivia');

    expectStatus(await olivia.post('/scoring-models', { modelRisk: 'medium', label: '2026.1' }), 201);

    expect(await entriesOf('PublishScoringModelVersionCommand')).toHaveLength(1);
  });

  it('audits IdentifyCustomer of customer-due-diligence', async () => {
    const operator = await dueDiligenceOperatorOf(application, 'ada');

    expectStatus(await operator.post('/customers', aPersonBody('12AB34567')), 201);

    expect(await entriesOf('IdentifyCustomerCommand')).toHaveLength(1);
  });

  it('audits SubmitApplication of credit-application', async () => {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const customer = await application.as({ id: 'customer-1', tenantId: 'bank-1' });
    const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };

    expectStatus(await customer.post('/applications', request), 201);

    expect(await entriesOf('SubmitApplicationCommand')).toHaveLength(1);
  });

  it('audits RecordScoringImpactAssessment of data-protection', async () => {
    await application.relate({ object: 'context:data-protection', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId: 'acme-bank' });

    expectStatus(await ada.post('/impact-assessments', { scoringModelVersion: '2026.2', month: '2026-05' }), 201);

    expect(await entriesOf('RecordScoringImpactAssessmentCommand')).toHaveLength(1);
  });

  it('audits CloseAlert of financial-crime', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');

    expectStatus(await ada.post('/alerts/alert-1/closure', { reason: 'Checked with the customer' }), 201);

    expect(await entriesOf('CloseAlertCommand')).toHaveLength(1);
  });
});
