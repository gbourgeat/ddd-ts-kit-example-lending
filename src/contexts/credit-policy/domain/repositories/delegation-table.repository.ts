import { Repository } from '@ddd-ts-kit/kernel';
import type { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';

export abstract class DelegationTableRepository extends Repository<DelegationTable> {}
