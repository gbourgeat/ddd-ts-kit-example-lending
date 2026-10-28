import { describe, expect, it } from '@jest/globals';
import type { Message } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { FlagAllOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.command';
import { FlagOverdueDueDiligenceJob } from '@/contexts/customer-due-diligence/application/scheduling/flag-overdue-due-diligence.job';

const occurrence = {
  scheduledAt: new Date('2026-01-01T07:00:00.000Z'),
  startedAt: new Date('2026-01-01T07:00:02.000Z'),
  attempt: 1,
  signal: new AbortController().signal,
  tenantId: 'tenant-a',
};

describe('Flag overdue due diligence, when its time comes', () => {
  it('sends flag all overdue due diligence as the system actor of the job', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toBeInstanceOf(FlagAllOverdueDueDiligenceCommand);

    expect(sent[0]).toMatchObject({
      actor: { id: 'system:customer-due-diligence.flag-overdue-due-diligence', type: 'system' },
    });
  });

  // TODO(domain): replace each entry below by a test of what "flag overdue due diligence" asks of the use case: the period it names from `scheduledAt`, and that a second run of the same occurrence changes nothing.
  it.todo('names the period of the occurrence, never the instant it really runs');
  it.todo('has the same outcome when the same occurrence runs twice');
});

function arrange() {
  const { commandBus } = createTestBuses();
  const sent: Message[] = [];

  commandBus.register(FlagAllOverdueDueDiligenceCommand, {
    execute: () =>
      Promise.reject(new Error('FlagAllOverdueDueDiligenceCommand is recorded before it reaches a handler')),
  });

  commandBus.use(async (message) => {
    sent.push(message);
  });

  return { job: new FlagOverdueDueDiligenceJob(commandBus), sent };
}
