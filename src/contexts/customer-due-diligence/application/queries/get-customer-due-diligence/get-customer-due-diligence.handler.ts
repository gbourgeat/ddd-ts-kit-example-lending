import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { Actor, QueryHandler } from '@ddd-ts-kit/kernel';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import type { GetCustomerDueDiligenceReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-due-diligence-reader.port';
import type { GetCustomerDueDiligenceQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.query';
import type { GetCustomerDueDiligenceResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.result';

const CONTEXT = 'customer-due-diligence';

export class GetCustomerDueDiligenceHandler implements QueryHandler<GetCustomerDueDiligenceQuery> {
  constructor(
    private readonly reader: GetCustomerDueDiligenceReader,
    private readonly access: Access,
  ) {}

  async execute(query: GetCustomerDueDiligenceQuery): Promise<GetCustomerDueDiligenceResult> {
    const scope = await this.readableScope(query.actor);

    return this.reader.read(query.customerId, scope);
  }

  /** An operator of the context reads every due diligence; any other actor reads those of the customers of its portfolios. */
  private async readableScope(actor: Actor): Promise<AccessScope> {
    const onContext = await this.access.scope(actor, customerDueDiligencePermissions['due-diligence.read'], 'context');

    if (onContext.kind === 'all' || (onContext.kind === 'ids' && onContext.ids.includes(CONTEXT))) {
      return { kind: 'all' };
    }

    return this.access.scope(actor, customerDueDiligencePermissions['due-diligence.view'], 'customer');
  }
}
