import type { ProcessDecision, ProcessManager } from '@ddd-ts-kit/kernel';

export interface CopyOfDataState {
  readonly id: string;
  readonly deadline: string;
  // TODO(domain): add what the next steps decide from, identifiers and values, never an aggregate.
}

const DEADLINE = 'deadline';

export class CopyOfDataProcess implements ProcessManager<CopyOfDataState> {
  static readonly processName = 'data-protection.copy-of-data';

  static readonly timeoutJob = 'data-protection.copy-of-data-timeout';

  static isState(value: unknown): value is CopyOfDataState {
    return typeof value === 'object' && value !== null && 'id' in value && 'deadline' in value;
  }

  // TODO(domain): take the event that starts the process (`ddd-ts-kit generate event-handler data-protection <Aggregate> <Event>`, whose handler calls this step).
  started(
    id: string,
    deadline: Date,
    current: CopyOfDataState | undefined,
  ): ProcessDecision<CopyOfDataState> | undefined {
    if (current !== undefined) {
      return undefined;
    }

    return { state: { id, deadline: deadline.toISOString() }, timeouts: [{ name: DEADLINE, at: deadline }] };
  }

  completed(current: CopyOfDataState | undefined): ProcessDecision<CopyOfDataState> | undefined {
    return current === undefined ? undefined : { state: current, cancel: [DEADLINE], ended: true };
  }

  timedOut(name: string, current: CopyOfDataState): ProcessDecision<CopyOfDataState> | undefined {
    if (name !== DEADLINE) {
      return undefined;
    }

    // TODO(domain): send the command that answers a missed deadline, as the process: `commands: [new <UseCase>Command(systemActor(CopyOfDataProcess.processName), ...)]`.
    return { state: current, ended: true };
  }
}
