# Worked examples of the annual percentage rate

Given by the product owner for step 7 (row US8.04). The annual percentage rate (APR) is the rate of the
actuarial formula of Annex I of the Consumer Credit Directive 2008/48/EC, kept by Directive 2023/2225.

## Reading rules

- Amounts are in euros, to the cent. The rate is stated to one decimal, rounded half up.
- Times are in years from the drawdown. The instalments fall at k/12 years, k = 1 to the number of months.
- The instalment is the constant capital-and-interest payment at the nominal rate (monthly rate nominal / 12).
  It does not include the monthly fee.
- The monthly fee is a charge of every repayment: it is part of the repayment stream of the APR.
- The upfront fee reduces the amount received by the borrower: the credit net of charges is the amount less it.
- The APR is the rate X that equates the credit net of charges with the discounted repayments:
  `amount - upfront fee = sum over k of (instalment + monthly fee) x (1 + X)^(-k/12)`.

## Examples

| Credit | Upfront fee | Months | Nominal rate | Monthly fee | Instalment | APR |
|---|---|---|---|---|---|---|
| 10,000.00 | 0.00 | 36 | 5.0 % | 0.00 | 299.71 | 5.1 % |
| 10,000.00 | 200.00 | 36 | 5.0 % | 0.00 | 299.71 | 6.5 % |
| 5,000.00 | 150.00 | 24 | 6.9 % | 0.00 | 223.64 | 10.4 % |
| 20,000.00 | 0.00 | 60 | 3.9 % | 5.00 | 367.43 | 4.5 % |
| 1,500.00 | 50.00 | 12 | 0.0 % | 0.00 | 125.00 | 6.5 % |

The instalment of each row is the one the formula gives at the nominal rate, rounded to the cent. A zero
nominal rate gives the credit divided by the number of months.

## Checks of the conductor

The rows were checked with an independent bisection on the formula above before commit. The unrounded
APRs are 5.1164, 6.5425, 10.3916, 4.5447 and 6.4909 per cent: each rounds to the stated rate at one decimal.
The fourth row needs the monthly fee in the repayment stream: without it the APR is 3.9706 per cent.

The test of US8.04 proves the formula against each row in cents (`docs/architecture/slices.md`).
