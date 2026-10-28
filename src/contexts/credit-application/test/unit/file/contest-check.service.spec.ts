import { describe, expect, it } from '@jest/globals';
import { ContestCheckService } from '@/contexts/credit-application/file/domain/services/contest-check.service';

const contest = { requesterId: 'applicant-1', reason: 'Wrong income.', contestedAt: new Date(0) };

describe('ContestCheckService', () => {
  it('records the contestation of a decided file', () => {
    const event = new ContestCheckService().eventOf(
      'id-1',
      { decision: { outcome: 'refuse' }, contestation: undefined },
      contest,
    );

    expect(event.name).toBe('credit-application.credit-application.contested');
  });

  it('refuses a contestation of a file not decided, by its code', () => {
    expect(() =>
      new ContestCheckService().eventOf('id-1', { decision: undefined, contestation: undefined }, contest),
    ).toThrow(expect.objectContaining({ code: 'CONTEST_NOT_DECIDED' }));
  });

  it('refuses a second contestation, by its code', () => {
    expect(() =>
      new ContestCheckService().eventOf(
        'id-1',
        { decision: { outcome: 'approve' }, contestation: { requesterId: 'applicant-1' } },
        contest,
      ),
    ).toThrow(expect.objectContaining({ code: 'CONTEST_ALREADY_RECORDED' }));
  });
});
