import { describe, expect, it } from '@jest/globals';
import { ActuarialFormulaService } from '@/contexts/credit-application/offer/domain/services/actuarial-formula.service';
import { Money } from '@/shared-kernel/money.vo';

/**
 * The four worked examples of the report prepared for the European Commission (docs/architecture/apr-worked-examples.md).
 * Amounts in cents: the credit of 200,000.00 less the fee of 4,000.00 at drawdown is the net credit. The rate is the
 * decimal the report states to six decimals of a per cent (6.434412 per cent is 0.06434412).
 */
const NET_CREDIT = Money.ofCents(19600000);
const MONTHS = 240;
const ONE_MONTH = { months: 1, days: 0 };
const TOLERANCE_AS_RATE = 0.000000005;

const WORKED_EXAMPLES = [
  {
    example: '1',
    instalment: Money.ofCents(143286),
    monthlyFee: Money.ofCents(0),
    firstInstalmentAfter: ONE_MONTH,
    rate: 0.06434412,
    apr: '6.4',
  },
  {
    example: '2, case 1',
    instalment: Money.ofCents(143357),
    monthlyFee: Money.ofCents(0),
    firstInstalmentAfter: { months: 1, days: 3 },
    rate: 0.06434185,
    apr: '6.4',
  },
  {
    example: '3, home insurance of 200.00 a year',
    instalment: Money.ofCents(143286),
    monthlyFee: Money.ofCents(1667),
    firstInstalmentAfter: ONE_MONTH,
    rate: 0.06588554,
    apr: '6.6',
  },
  {
    example: '4, payment protection of 1 per cent a year',
    instalment: Money.ofCents(143286),
    monthlyFee: Money.ofCents(16667),
    firstInstalmentAfter: ONE_MONTH,
    rate: 0.07946625,
    apr: '7.9',
  },
];

describe('ActuarialFormulaService', () => {
  const service = new ActuarialFormulaService();

  it('holds no state of its own', () => {
    expect(Object.keys(new ActuarialFormulaService())).toEqual([]);
  });

  it('gives the instalment of a one month loan as the amount with its interest', () => {
    const instalment = service.instalmentOf({ amount: Money.ofCents(100000), months: 1, nominalRate: 0.12 });

    expect(instalment.cents).toBe(101000);
  });

  it('gives an instalment of the amount divided by the months when the nominal rate is zero', () => {
    const instalment = service.instalmentOf({ amount: Money.ofCents(150000), months: 12, nominalRate: 0 });

    expect(instalment.cents).toBe(12500);
  });

  it.each(WORKED_EXAMPLES)(
    'gives the annual rate of the worked example $example to six decimals of a per cent',
    (example) => {
      const rate = service.annualRateOf({
        netCredit: NET_CREDIT,
        instalment: example.instalment,
        monthlyFee: example.monthlyFee,
        months: MONTHS,
        firstInstalmentAfter: example.firstInstalmentAfter,
      });

      expect(Math.abs(rate - example.rate)).toBeLessThanOrEqual(TOLERANCE_AS_RATE);
    },
  );

  it.each(WORKED_EXAMPLES)(
    'gives the annual percentage rate of the worked example $example to one decimal',
    (example) => {
      const apr = service.annualPercentageRateOf({
        netCredit: NET_CREDIT,
        instalment: example.instalment,
        monthlyFee: example.monthlyFee,
        months: MONTHS,
        firstInstalmentAfter: example.firstInstalmentAfter,
      });

      expect(apr.percent).toBe(example.apr);
    },
  );
});
