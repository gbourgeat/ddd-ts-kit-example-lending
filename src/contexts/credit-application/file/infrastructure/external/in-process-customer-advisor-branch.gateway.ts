import type { CustomerAdvisorBranchContract } from '@/contexts/branch-network/published-language';
import type { CustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/application/ports/customer-advisor-branch-gateway.port';

// TODO(platform): when branch-network runs as its own service, write the remote adapter of CustomerAdvisorBranchGateway next to this one (an HTTP or RPC client with a timeout, retries and a fallback) and bind it instead; nothing else changes.
export class InProcessCustomerAdvisorBranchGateway implements CustomerAdvisorBranchGateway {
  constructor(readonly upstream: CustomerAdvisorBranchContract) {}

  // TODO(domain): implement each operation of CustomerAdvisorBranchGateway by asking `this.upstream`, translating its answer into the types of credit-application.
}
