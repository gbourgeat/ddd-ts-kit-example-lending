import { Repository } from '@ddd-ts-kit/kernel';
import type { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';

export abstract class ImpactAssessmentRepository extends Repository<ImpactAssessment> {}
