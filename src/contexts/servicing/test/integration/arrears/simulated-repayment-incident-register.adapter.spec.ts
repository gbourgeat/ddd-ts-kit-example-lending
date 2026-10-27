import { describe, expect, it } from '@jest/globals';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/servicing/arrears/infrastructure/external/simulated-repayment-incident-register.adapter';

describe('SimulatedRepaymentIncidentRegister', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedRepaymentIncidentRegister()).toBeInstanceOf(SimulatedRepaymentIncidentRegister);
  });

  it('keeps a loan declared once it is declared', async () => {
    const register = new SimulatedRepaymentIncidentRegister();

    await register.declare('LOAN-1');

    expect(register.isDeclared('LOAN-1')).toBe(true);
  });

  it('withdraws the declaration once the arrears are paid', async () => {
    const register = new SimulatedRepaymentIncidentRegister();

    await register.declare('LOAN-1');

    await register.withdraw('LOAN-1');

    expect(register.isDeclared('LOAN-1')).toBe(false);
  });
});
