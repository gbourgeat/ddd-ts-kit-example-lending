import type { BackgroundJob, BackgroundJobExecution, ProcessRunner, ProcessTimeoutDue } from '@ddd-ts-kit/kernel';
import { CopyOfDataProcess } from '@/contexts/data-protection/application/processes/copy-of-data.process';

export class CopyOfDataTimeoutBackgroundJob implements BackgroundJob<ProcessTimeoutDue> {
  static readonly jobName = 'data-protection.copy-of-data-timeout';

  private readonly process = new CopyOfDataProcess();

  constructor(private readonly processes: ProcessRunner) {}

  async run(due: ProcessTimeoutDue, execution: BackgroundJobExecution): Promise<void> {
    const delivered = { ...due, jobId: execution.jobId };

    await this.processes.timeout(CopyOfDataProcess, delivered, (current) =>
      this.process.timedOut(due.timeout, current),
    );
  }
}
