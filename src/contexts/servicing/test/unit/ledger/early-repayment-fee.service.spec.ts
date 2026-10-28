import { describe, expect, it } from '@jest/globals';
import { EarlyRepaymentFeeService } from '@/contexts/servicing/ledger/domain/services/early-repayment-fee.service';
import { Money } from '@/shared-kernel/money.vo';

describe('Early repayment fee', () => {
  it('charges 1 percent of the capital repaid when more than twelve months of the schedule remain', () => {
    const fee = new EarlyRepaymentFeeService().of(Money.ofCents(100_000), 13);

    expect(fee.cents).toBe(1000);
  });

  it('charges 0.5 percent of the capital repaid when twelve months or fewer of the schedule remain', () => {
    const fee = new EarlyRepaymentFeeService().of(Money.ofCents(100_000), 12);

    expect(fee.cents).toBe(500);
  });

  it('rounds the fee down to the whole cent', () => {
    const fee = new EarlyRepaymentFeeService().of(Money.ofCents(12_345), 12);

    expect(fee.cents).toBe(61);
  });
});
