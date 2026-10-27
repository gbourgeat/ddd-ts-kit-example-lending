import { Repository } from '@ddd-ts-kit/kernel';
import type { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';

export abstract class CustomerRepository extends Repository<Customer> {
  // TODO(domain): add only the lookups a use case needs, as abstract methods named in the ubiquitous language (for example `abstract findByNumber(number: InvoiceNumber): Promise<Customer | undefined>`); queries for screens go through a read port instead.
}
