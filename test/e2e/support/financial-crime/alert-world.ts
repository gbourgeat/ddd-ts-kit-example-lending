import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The bank's tenant, where the compliance officers of the bank operate financial-crime. */
export const bankTenantId = 'acme-bank';

/** A signed-in person who operates financial-crime, as the operators of the context are granted: the compliance group. */
export async function complianceOfficer(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:financial-crime', relation: 'operator', subject: `user:${id}` });

  return application.as({ id, tenantId: bankTenantId });
}

/**
 * Stores an alert as the repayment rules raise it. No route raises an alert yet, so the row is
 * written where the aggregate's table keeps it: the arrangement only, the assertions go through the API.
 */
export async function raisedAlert(
  application: RunningApplication,
  id: string,
  tenantId: string = bankTenantId,
): Promise<string> {
  const at = new Date('2026-10-01T00:00:00.000Z');

  await application.persistence.database.client().financialCrimeAlert.create({
    data: {
      id,
      registeredAt: at,
      repaymentReference: `repayment-of-${id}`,
      closedAt: null,
      closureReason: null,
      version: 1,
      tenantId,
      createdAt: at,
      createdBy: 'system',
      updatedAt: at,
      updatedBy: 'system',
    },
  });

  return id;
}

/** Files a suspicious activity report on an alert through the API, and returns its identifier. */
export async function filedReport(compliance: HttpClient, alertId: string): Promise<string> {
  const filed = expectStatus(await compliance.post(`/alerts/${alertId}/reports`, {}), 201);

  return (filed.body as { id: string }).id;
}

/** A refusal's body without the identifier of its request, which differs from one request to the next. */
export function withoutRequestId(body: unknown): unknown {
  const { requestId: _requestId, ...rest } = body as Record<string, unknown>;

  return rest;
}
