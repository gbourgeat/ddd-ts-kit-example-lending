import { describe, expect, it } from '@jest/globals';
import type { Message } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';
import { ComputeDueInstalmentsJob } from '@/contexts/servicing/instalments/application/scheduling/compute-due-instalments.job';

const occurrence = {
  scheduledAt: new Date('2026-01-01T07:00:00.000Z'),
  startedAt: new Date('2026-01-01T07:00:02.000Z'),
  attempt: 1,
  signal: new AbortController().signal,
  tenantId: 'tenant-a',
};

describe('Compute due instalments, when its time comes', () => {
  it('sends compute due instalments as the system actor of the job', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toBeInstanceOf(ComputeDueInstalmentsCommand);
    expect(sent[0]).toMatchObject({ actor: { id: 'system:servicing.compute-due-instalments', type: 'system' } });
  });

  // TODO(domain): replace each entry below by a test of what "compute due instalments" asks of the use case: the period it names from `scheduledAt`, and that a second run of the same occurrence changes nothing.
  it.todo('names the period of the occurrence, never the instant it really runs');
  it.todo('has the same outcome when the same occurrence runs twice');
});

function arrange() {
  const { commandBus } = createTestBuses();
  const sent: Message[] = [];

  commandBus.register(ComputeDueInstalmentsCommand, {
    execute: () => Promise.reject(new Error('ComputeDueInstalmentsCommand is recorded before it reaches a handler')),
  });

  commandBus.use(async (message) => {
    sent.push(message);
  });

  return { job: new ComputeDueInstalmentsJob(commandBus), sent };
}
