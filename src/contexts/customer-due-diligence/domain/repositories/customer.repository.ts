import { Repository } from '@ddd-ts-kit/kernel';
import type { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';

export abstract class CustomerRepository extends Repository<Customer> {}
