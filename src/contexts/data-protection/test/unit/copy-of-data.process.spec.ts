import { describe, expect, it } from '@jest/globals';
import { givenProcess } from '@ddd-ts-kit/testing';
import { CopyOfDataProcess } from '@/contexts/data-protection/application/processes/copy-of-data.process';

const deadline = new Date('2026-03-01T12:00:00.000Z');
const process = new CopyOfDataProcess();
const waiting = { id: 'copy-of-data-1', deadline: deadline.toISOString() };

describe('Copy of data', () => {
  it('starts and waits until its deadline', () => {
    givenProcess<typeof waiting>(undefined)
      .when((current) => process.started('copy-of-data-1', deadline, current))
      .thenState(waiting)
      .thenTimeouts([{ name: 'deadline', at: deadline }])
      .thenCommands([]);
  });

  it('does not start twice', () => {
    givenProcess(waiting)
      .when((current) => process.started('copy-of-data-1', deadline, current))
      .thenIgnored();
  });

  it('ends in time and disarms its deadline', () => {
    givenProcess(waiting)
      .when((current) => process.completed(current))
      .thenCancelled(['deadline'])
      .thenEnded();
  });

  it('ends at its deadline', () => {
    givenProcess(waiting).when(timedOut('deadline')).thenEnded();
  });

  it('recognises the state it saved', () => {
    expect(CopyOfDataProcess.isState(waiting)).toBe(true);
    expect(CopyOfDataProcess.isState({ id: 'unknown-1' })).toBe(false);
  });

  // TODO(domain): one case per step, and the commands a missed deadline sends.
  it.todo('sends the command that answers a missed deadline');
});

function timedOut(timeout: string) {
  return (current: typeof waiting | undefined) =>
    current === undefined ? undefined : process.timedOut(timeout, current);
}
