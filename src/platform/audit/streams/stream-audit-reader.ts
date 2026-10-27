import type { Authorizer } from '@ddd-ts-kit/auth';
import type { AuditEntry, AuditFilter, AuditReader, AuditSortField } from '@ddd-ts-kit/audit';
import { pageOf, type ExecutionScope, type Page, type PageRequest } from '@ddd-ts-kit/kernel';
import { financialCrimeStream } from '@/platform/audit/streams/financial-crime-stream';

/**
 * The trail as its readers search it. A reader of the financial-crime stream sees the whole
 * trail of the tenant. Anyone else is confined to the chain of the tenant, which holds no entry
 * of the stream: a search filter cannot exclude a chain, so the confinement is by the one chain
 * that stays. Work with no tenant, and platform staff reading across tenants, find nothing.
 */
export class StreamAuditReader implements AuditReader {
  constructor(
    private readonly reader: AuditReader,
    private readonly scope: ExecutionScope,
    private readonly authorizer: Authorizer,
  ) {}

  async search(filter: AuditFilter, page: PageRequest<AuditSortField>): Promise<Page<AuditEntry>> {
    const { actor, tenantId } = this.scope.require();

    const decision = await this.authorizer.check({
      actor,
      permission: financialCrimeStream.permission,
      resource: financialCrimeStream.resource,
    });

    if (decision.allowed) {
      return this.reader.search(filter, page);
    }

    if (tenantId === undefined) {
      return pageOf([], { total: 0 });
    }

    return this.reader.search({ ...filter, chain: `tenant:${tenantId}` }, page);
  }
}
