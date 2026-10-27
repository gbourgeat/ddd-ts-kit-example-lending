import { describe, expect, it } from '@jest/globals';
import type { Message } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { CheckRegistrationCommand } from '@/contexts/brokerage/application/commands/check-registration/check-registration.command';
import { CheckRegistrationJob } from '@/contexts/brokerage/application/scheduling/check-registration.job';

const occurrence = {
  scheduledAt: new Date('2026-01-01T07:00:00.000Z'),
  startedAt: new Date('2026-01-01T07:00:02.000Z'),
  attempt: 1,
  signal: new AbortController().signal,
  tenantId: 'tenant-a',
};

describe('Check registration, when its time comes', () => {
  it('sends check registration as the system actor of the job', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toBeInstanceOf(CheckRegistrationCommand);
    expect(sent[0]).toMatchObject({ actor: { id: 'system:brokerage.check-registration', type: 'system' } });
  });

  // TODO(domain): replace each entry below by a test of what "check registration" asks of the use case: the period it names from `scheduledAt`, and that a second run of the same occurrence changes nothing.
  it.todo('names the period of the occurrence, never the instant it really runs');
  it.todo('has the same outcome when the same occurrence runs twice');
});

function arrange() {
  const { commandBus } = createTestBuses();
  const sent: Message[] = [];

  commandBus.register(CheckRegistrationCommand, {
    execute: () => Promise.reject(new Error('CheckRegistrationCommand is recorded before it reaches a handler')),
  });

  commandBus.use(async (message) => {
    sent.push(message);
  });

  return { job: new CheckRegistrationJob(commandBus), sent };
}
