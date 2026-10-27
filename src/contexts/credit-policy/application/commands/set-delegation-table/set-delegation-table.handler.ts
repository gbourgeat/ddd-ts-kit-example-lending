import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import type { DelegationTableRepository } from '@/contexts/credit-policy/domain/repositories/delegation-table.repository';
import { DelegationLimit } from '@/contexts/credit-policy/domain/value-objects/delegation-limit.vo';
import { DelegationTableTerms } from '@/contexts/credit-policy/domain/value-objects/delegation-table-terms.vo';
import type { SetDelegationTableCommand } from '@/contexts/credit-policy/application/commands/set-delegation-table/set-delegation-table.command';

export class SetDelegationTableHandler implements CommandHandler<SetDelegationTableCommand> {
  constructor(
    private readonly delegationTableRepository: DelegationTableRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: SetDelegationTableCommand): Promise<string> {
    const terms = DelegationTableTerms.create({
      effectiveFrom: command.terms.effectiveFrom,
      limits: command.terms.limits.map((limit) => DelegationLimit.create(limit)),
    });

    const delegationTable = DelegationTable.create(this.ids.next(), terms, this.clock.now());

    await this.delegationTableRepository.save(delegationTable);

    return delegationTable.id;
  }
}
