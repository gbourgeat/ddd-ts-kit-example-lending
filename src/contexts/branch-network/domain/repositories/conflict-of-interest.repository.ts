import { Repository } from '@ddd-ts-kit/kernel';
import type { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';

export abstract class ConflictOfInterestRepository extends Repository<ConflictOfInterest> {}
