import { Repository } from '@ddd-ts-kit/kernel';
import type { Branch } from '@/contexts/branch-network/domain/aggregates/branch.aggregate';

export abstract class BranchRepository extends Repository<Branch> {}
