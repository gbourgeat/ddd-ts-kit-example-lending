import { describe, expect, it } from '@jest/globals';
import type { Message } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionJob } from '@/contexts/servicing/ledger/application/scheduling/erase-personal-data-past-retention.job';

const occurrence = {
  scheduledAt: new Date('2026-01-01T07:00:00.000Z'),
  startedAt: new Date('2026-01-01T07:00:02.000Z'),
  attempt: 1,
  signal: new AbortController().signal,
  tenantId: 'tenant-a',
};

describe('Erase personal data past retention, when its time comes', () => {
  it('sends erase personal data past retention as the system actor of the job', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toBeInstanceOf(ErasePersonalDataPastRetentionCommand);

    expect(sent[0]).toMatchObject({
      actor: { id: 'system:servicing.erase-personal-data-past-retention', type: 'system' },
    });
  });

  it('names the period of the occurrence, never the instant it really runs', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent[0]).toMatchObject({ asOf: occurrence.scheduledAt });
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const sent: Message[] = [];

  commandBus.register(ErasePersonalDataPastRetentionCommand, {
    execute: () =>
      Promise.reject(new Error('ErasePersonalDataPastRetentionCommand is recorded before it reaches a handler')),
  });

  commandBus.use(async (message) => {
    sent.push(message);
  });

  return { job: new ErasePersonalDataPastRetentionJob(commandBus), sent };
}
