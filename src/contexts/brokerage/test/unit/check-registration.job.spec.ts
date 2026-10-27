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

  it('names the day of the occurrence, never the instant the check really runs', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent[0]).toMatchObject({ day: occurrence.scheduledAt });
  });

  it('asks for the same day when the same occurrence runs twice', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);
    await job.run(occurrence);

    expect(sent.map((message) => (message as CheckRegistrationCommand).day)).toEqual([
      occurrence.scheduledAt,
      occurrence.scheduledAt,
    ]);
  });
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
