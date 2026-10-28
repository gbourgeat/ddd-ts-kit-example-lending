import type { CustomerIdentityContract } from '@/contexts/customer-due-diligence/published-language/customer-identity.contract';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';

/** Answers the name and the birth date of an identified customer, read from its aggregate. */
export class CustomerIdentityAnswer implements CustomerIdentityContract {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async identityOf(customerId: string): Promise<{ name: string; birthDate: string } | undefined> {
    const customer = await this.customerRepository.findById(customerId);
    const person = customer?.toState().identifiedPerson;

    if (person === undefined) {
      return undefined;
    }

    return { name: person.name, birthDate: person.birthDate.toISOString() };
  }
}
