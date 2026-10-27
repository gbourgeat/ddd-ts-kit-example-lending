import { describe, expect, it } from '@jest/globals';
import { SimulatedBorrowerNotifier } from '@/contexts/servicing/arrears/infrastructure/external/simulated-borrower-notifier.adapter';

describe('SimulatedBorrowerNotifier', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedBorrowerNotifier()).toBeInstanceOf(SimulatedBorrowerNotifier);
  });

  it('delivers the message to the borrower it is addressed to', async () => {
    const notifier = new SimulatedBorrowerNotifier();

    await notifier.notify('Jean Dupont', 'Your instalment is overdue');

    expect(notifier.messagesTo('Jean Dupont')).toEqual(['Your instalment is overdue']);
  });

  it('keeps no message for another borrower', async () => {
    const notifier = new SimulatedBorrowerNotifier();

    await notifier.notify('Jean Dupont', 'Your instalment is overdue');

    expect(notifier.messagesTo('Marie Curie')).toEqual([]);
  });
});
