import { describe, expect, it } from '@jest/globals';
import { InMemoryProcessStore, type BackgroundJob } from '@ddd-ts-kit/kernel';
import { InMemoryJobStore, QueueWorker, StoredJobQueue, StoredProcessRunner } from '@ddd-ts-kit/scheduling';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { CopyOfDataTimeoutBackgroundJob } from '@/contexts/data-protection/application/background/copy-of-data-timeout.background-job';
import { CopyOfDataProcess } from '@/contexts/data-protection/application/processes/copy-of-data.process';

const HOUR = 3_600_000;

describe('The timeout of copy of data, when its job runs', () => {
  it('runs the step of the deadline once it is due, and not before', async () => {
    const { clock, processes, runner, worker } = arrange();
    const deadline = new Date(clock.now().getTime() + HOUR);
    const process = new CopyOfDataProcess();
    const id = 'copy-of-data-1';

    await runner.run(CopyOfDataProcess, id, (current) => process.started(id, deadline, current));

    expect(await worker.runDue()).toEqual([]);

    clock.advance(HOUR);

    expect(await worker.runDue()).toMatchObject([
      { job: 'data-protection.copy-of-data-timeout', outcome: 'succeeded' },
    ]);

    expect(processes.list()).toMatchObject([{ ended: true }]);
  });
});

/** The runner, the queue of its timeouts and the worker in memory, on the clock, the buses and the unit of work of the test buses. */
function arrange() {
  const { commandBus, clock, ids, executionScope, unitOfWork } = createTestBuses();
  const store = new InMemoryJobStore();
  const processes = new InMemoryProcessStore();
  const jobQueue = new StoredJobQueue({ store, clock, ids, scope: executionScope });
  const runner = new StoredProcessRunner({ store: processes, jobs: jobQueue, commands: commandBus, unitOfWork });
  const worker = new QueueWorker({ store, clock, scope: executionScope });
  const job: BackgroundJob<unknown> = new CopyOfDataTimeoutBackgroundJob(runner);

  worker.register({ name: CopyOfDataTimeoutBackgroundJob.jobName, run: (due, execution) => job.run(due, execution) });

  return { clock, processes, runner, worker };
}
