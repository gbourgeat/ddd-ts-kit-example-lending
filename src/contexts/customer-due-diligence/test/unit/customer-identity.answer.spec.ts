import { describe, expect, it } from '@jest/globals';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentityAnswer } from '@/contexts/customer-due-diligence/application/contracts/customer-identity.answer';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const bornAt = new Date('2026-01-10T00:00:00.000Z');
const birthDate = new Date('1980-05-01T00:00:00.000Z');

describe('CustomerIdentityAnswer', () => {
  it('answers the name and the birth date an identified customer was checked on', async () => {
    const repository = new FakeCustomerRepository();
    const customer = Customer.create('customer-9', aPersonIdentity(), bornAt, { name: 'Ada Lovelace', birthDate });

    await repository.save(customer);

    const answer = await new CustomerIdentityAnswer(repository).identityOf('customer-9');

    expect(answer).toEqual({ name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' });
  });

  it('answers nothing for a customer identified without a name and a birth date', async () => {
    const repository = new FakeCustomerRepository();

    await repository.save(Customer.create('customer-9', aPersonIdentity(), bornAt));

    const answer = await new CustomerIdentityAnswer(repository).identityOf('customer-9');

    expect(answer).toBeUndefined();
  });

  it('answers nothing for a customer that is not identified', async () => {
    const repository = new FakeCustomerRepository();

    const answer = await new CustomerIdentityAnswer(repository).identityOf('customer-unknown');

    expect(answer).toBeUndefined();
  });
});
