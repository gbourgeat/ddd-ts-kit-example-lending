import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';
import type { ResidualIncomeMinimumRepository } from '@/contexts/credit-policy/domain/repositories/residual-income-minimum.repository';
import { ResidualIncomeMinimumAmount } from '@/contexts/credit-policy/domain/value-objects/residual-income-minimum-amount.vo';
import type { SetResidualIncomeMinimumCommand } from '@/contexts/credit-policy/application/commands/set-residual-income-minimum/set-residual-income-minimum.command';

export class SetResidualIncomeMinimumHandler implements CommandHandler<SetResidualIncomeMinimumCommand> {
  constructor(
    private readonly residualIncomeMinimumRepository: ResidualIncomeMinimumRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: SetResidualIncomeMinimumCommand): Promise<string> {
    const now = this.clock.now();

    const perAdult = ResidualIncomeMinimumAmount.create(command.perAdultInCents);
    const perChild = ResidualIncomeMinimumAmount.create(command.perChildInCents);

    const residualIncomeMinimum = ResidualIncomeMinimum.create(
      this.ids.next(),
      { perAdultInCents: perAdult.cents, perChildInCents: perChild.cents, effectiveFrom: now },
      now,
    );

    await this.residualIncomeMinimumRepository.save(residualIncomeMinimum);

    return residualIncomeMinimum.id;
  }
}
