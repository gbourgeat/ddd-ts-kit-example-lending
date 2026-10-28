import type { CustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/application/ports/customer-advisor-branch-gateway.port';

export class FakeCustomerAdvisorBranchGateway implements CustomerAdvisorBranchGateway {
  private readonly branches = new Map<string, string>();

  answerBranchOf(customerId: string, branchId: string): void {
    this.branches.set(customerId, branchId);
  }

  async branchOfCustomerAdvisor(customerId: string): Promise<string | undefined> {
    return this.branches.get(customerId);
  }
}
