import type { CustomerIdentityGateway } from '@/contexts/credit-application/assessment/application/ports/customer-identity-gateway.port';

export class FakeCustomerIdentityGateway implements CustomerIdentityGateway {
  private readonly identities = new Map<string, { name: string; birthDate: string }>();

  answerIdentityOf(customerId: string, identity: { name: string; birthDate: string }): void {
    this.identities.set(customerId, identity);
  }

  async identityOf(customerId: string): Promise<{ name: string; birthDate: string } | undefined> {
    return this.identities.get(customerId);
  }
}
