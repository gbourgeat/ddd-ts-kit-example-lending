import { describe, expect, it } from '@jest/globals';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-repayment-incident-register.adapter';

describe('SimulatedRepaymentIncidentRegister', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedRepaymentIncidentRegister()).toBeInstanceOf(SimulatedRepaymentIncidentRegister);
  });

  it('lists a borrower the register carries', async () => {
    const register = new SimulatedRepaymentIncidentRegister();

    register.record('Jean Dupont', new Date('1970-03-02'));

    await expect(register.isListed('Jean Dupont', new Date('1970-03-02'))).resolves.toBe(true);
  });

  it('does not list a borrower the register does not carry', async () => {
    const register = new SimulatedRepaymentIncidentRegister();

    register.record('Jean Dupont', new Date('1970-03-02'));

    await expect(register.isListed('Marie Curie', new Date('1867-11-07'))).resolves.toBe(false);
  });
});
