import { describe, expect, it } from '@jest/globals';
import { ActuarialFormulaService } from '@/contexts/credit-application/offer/domain/services/actuarial-formula.service';
import { Money } from '@/shared-kernel/money.vo';

/**
 * The worked examples of the directive, given by the product owner (docs/architecture/apr-worked-examples.md).
 * Amounts in cents, rates in tenths of a per cent, nominal rate as a decimal.
 */
const WORKED_EXAMPLES = [
  { credit: 1000000, upfrontFee: 0, months: 36, nominalRate: 0.05, monthlyFee: 0, instalment: 29971, apr: 51 },
  { credit: 1000000, upfrontFee: 20000, months: 36, nominalRate: 0.05, monthlyFee: 0, instalment: 29971, apr: 65 },
  { credit: 500000, upfrontFee: 15000, months: 24, nominalRate: 0.069, monthlyFee: 0, instalment: 22364, apr: 104 },
  { credit: 2000000, upfrontFee: 0, months: 60, nominalRate: 0.039, monthlyFee: 500, instalment: 36743, apr: 45 },
  { credit: 150000, upfrontFee: 5000, months: 12, nominalRate: 0, monthlyFee: 0, instalment: 12500, apr: 65 },
];

describe('ActuarialFormulaService', () => {
  const service = new ActuarialFormulaService();

  it('holds no state of its own', () => {
    expect(Object.keys(new ActuarialFormulaService())).toEqual([]);
  });

  it.each(WORKED_EXAMPLES)(
    'gives the instalment of $credit cents over $months months at the nominal rate: $instalment cents',
    (example) => {
      const instalment = service.instalmentOf({
        amount: Money.ofCents(example.credit),
        months: example.months,
        nominalRate: example.nominalRate,
      });

      expect(instalment.cents).toBe(example.instalment);
    },
  );

  it.each(WORKED_EXAMPLES)(
    'gives the annual percentage rate of the worked example of $credit cents: $apr tenths of a per cent',
    (example) => {
      const apr = service.annualPercentageRateOf({
        netCredit: Money.ofCents(example.credit - example.upfrontFee),
        instalment: Money.ofCents(example.instalment),
        monthlyFee: Money.ofCents(example.monthlyFee),
        months: example.months,
      });

      expect(apr.tenths).toBe(example.apr);
    },
  );
});
