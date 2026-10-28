import { ValueObject } from '@ddd-ts-kit/kernel';
import { InstalmentScheduleService } from '@/contexts/servicing/ledger/domain/services/instalment-schedule.service';
import type { Money } from '@/shared-kernel/money.vo';

export type LoanScheduleProps = {
  readonly principal: Money;
  readonly annualRateBasisPoints: number;
  readonly durationMonths: number;
  readonly instalments: readonly Money[];
};

/** The schedule of a loan: its amount, its rate, its duration and the instalments due, in order. */
export class LoanSchedule extends ValueObject<LoanScheduleProps> {
  private constructor(props: LoanScheduleProps) {
    super(props);
  }

  /** The schedule of the signed offer: its instalments are computed from the amount, the rate and the duration. */
  static of(principal: Money, annualRateBasisPoints: number, durationMonths: number): LoanSchedule {
    const instalments = new InstalmentScheduleService().schedule({
      principal,
      annualRateBasisPoints,
      months: durationMonths,
    });

    return new LoanSchedule({ principal, annualRateBasisPoints, durationMonths, instalments });
  }

  /** The schedule as the ledger recorded it: read back, never computed again. */
  static recorded(props: LoanScheduleProps): LoanSchedule {
    return new LoanSchedule(props);
  }

  get principal(): Money {
    return this.props.principal;
  }

  get annualRateBasisPoints(): number {
    return this.props.annualRateBasisPoints;
  }

  get durationMonths(): number {
    return this.props.durationMonths;
  }

  get instalments(): readonly Money[] {
    return this.props.instalments;
  }
}
