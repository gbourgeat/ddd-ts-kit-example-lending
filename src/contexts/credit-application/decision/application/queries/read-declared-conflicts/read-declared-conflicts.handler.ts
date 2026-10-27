import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import type { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { ReadDeclaredConflictsResult } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.result';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

export class ReadDeclaredConflictsHandler implements QueryHandler<ReadDeclaredConflictsQuery> {
  constructor(
    private readonly declaredConflicts: DeclaredConflictsStore,
    private readonly creditApplicationRepository: CreditApplicationRepository,
  ) {}

  async execute(query: ReadDeclaredConflictsQuery): Promise<ReadDeclaredConflictsResult> {
    const creditApplication = await this.creditApplicationRepository.findById(query.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(query.applicationId);
    }

    const conflicts = await this.declaredConflicts.searchOfCustomer(creditApplication.applicantId);

    return new ReadDeclaredConflictsResult(conflicts);
  }
}
