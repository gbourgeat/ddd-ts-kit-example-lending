import { Repository } from '@ddd-ts-kit/kernel';
import type { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';

/** The organisations, by their slug. */
export abstract class OrganisationRepository extends Repository<Organisation> {}
