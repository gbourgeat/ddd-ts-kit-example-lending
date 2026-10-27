import { describe, expect, it } from '@jest/globals';
import { SimulatedIntermediariesRegister } from '@/contexts/brokerage/infrastructure/external/simulated-intermediaries-register.adapter';

describe('SimulatedIntermediariesRegister', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedIntermediariesRegister()).toBeInstanceOf(SimulatedIntermediariesRegister);
  });

  it('answers valid on a day within the dates of a recorded registration', async () => {
    const register = new SimulatedIntermediariesRegister();

    register.record('REG-1', new Date('2026-01-01'), new Date('2026-12-31'));

    await expect(register.isValidOn('REG-1', new Date('2026-06-01'))).resolves.toBe(true);
  });

  it('answers not valid before the registration starts and after it lapses', async () => {
    const register = new SimulatedIntermediariesRegister();

    register.record('REG-1', new Date('2026-01-01'), new Date('2026-12-31'));

    await expect(register.isValidOn('REG-1', new Date('2025-12-31'))).resolves.toBe(false);
    await expect(register.isValidOn('REG-1', new Date('2027-01-01'))).resolves.toBe(false);
  });

  it('refuses a registration number the register has no record of', async () => {
    const register = new SimulatedIntermediariesRegister();

    await expect(register.isValidOn('UNKNOWN', new Date('2026-06-01'))).resolves.toBe(false);
  });
});
