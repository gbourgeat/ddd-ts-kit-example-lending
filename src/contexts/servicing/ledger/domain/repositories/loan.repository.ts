import { Repository } from '@ddd-ts-kit/kernel';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

export abstract class LoanRepository extends Repository<Loan> {
  // TODO(domain): add only the lookups a use case needs, as abstract methods named in the ubiquitous language (for example `abstract findByNumber(number: InvoiceNumber): Promise<Loan | undefined>`); queries for screens go through a read port instead.
}
