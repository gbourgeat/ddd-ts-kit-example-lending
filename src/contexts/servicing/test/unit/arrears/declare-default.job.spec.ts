import { describe, expect, it } from '@jest/globals';
import type { Message } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { DeclareDefaultCommand } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.command';
import { DeclareDefaultJob } from '@/contexts/servicing/arrears/application/scheduling/declare-default.job';

const occurrence = {
  scheduledAt: new Date('2026-01-01T07:00:00.000Z'),
  startedAt: new Date('2026-01-01T07:00:02.000Z'),
  attempt: 1,
  signal: new AbortController().signal,
  tenantId: 'tenant-a',
};

describe('Declare default, when its time comes', () => {
  it('sends declare default as the system actor of the job', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent).toHaveLength(1);
    expect(sent[0]).toBeInstanceOf(DeclareDefaultCommand);
    expect(sent[0]).toMatchObject({ actor: { id: 'system:servicing.declare-default', type: 'system' } });
  });

  it('names the day of the occurrence, never the instant it really runs', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);

    expect(sent[0]).toMatchObject({ asOf: occurrence.scheduledAt });
  });

  it('sends the same declaration when the same occurrence runs twice', async () => {
    const { job, sent } = arrange();

    await job.run(occurrence);
    await job.run(occurrence);

    expect(sent).toHaveLength(2);
    expect(sent[1]).toMatchObject({ asOf: occurrence.scheduledAt });
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const sent: Message[] = [];

  commandBus.register(DeclareDefaultCommand, {
    execute: () => Promise.reject(new Error('DeclareDefaultCommand is recorded before it reaches a handler')),
  });

  commandBus.use(async (message) => {
    sent.push(message);
  });

  return { job: new DeclareDefaultJob(commandBus), sent };
}
