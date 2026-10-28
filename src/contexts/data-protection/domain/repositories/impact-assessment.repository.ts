import { Repository } from '@ddd-ts-kit/kernel';
import type { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';

export abstract class ImpactAssessmentRepository extends Repository<ImpactAssessment> {
  // TODO(domain): add only the lookups a use case needs, as abstract methods named in the ubiquitous language (for example `abstract findByNumber(number: InvoiceNumber): Promise<ImpactAssessment | undefined>`); queries for screens go through a read port instead.
}
