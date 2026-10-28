import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { DeciderLevels } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import type { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import type { ReadDeciderLevelResult } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.result';
import { UnknownDeciderLevel } from '@/contexts/credit-application/decision/domain/errors/unknown-decider-level.error';

export class ReadDeciderLevelHandler implements QueryHandler<ReadDeciderLevelQuery> {
  constructor(private readonly deciderLevels: DeciderLevels) {}

  async execute(query: ReadDeciderLevelQuery): Promise<ReadDeciderLevelResult> {
    const deciderLevel = await this.deciderLevels.get(query.staffMemberId);

    if (deciderLevel === undefined) {
      throw UnknownDeciderLevel.forUnknownDeciderLevel();
    }

    return {
      staffMemberId: deciderLevel.staffMemberId,
      branchId: deciderLevel.branchId,
      level: deciderLevel.level,
    };
  }
}
