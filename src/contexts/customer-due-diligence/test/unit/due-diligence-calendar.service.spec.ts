import { describe, expect, it } from '@jest/globals';
import { DueDiligenceCalendarService } from '@/contexts/customer-due-diligence/domain/services/due-diligence-calendar.service';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';

const calendar = new DueDiligenceCalendarService();
const refreshedOn = new Date('2026-10-28T08:00:00.000Z');

describe('DueDiligenceCalendarService', () => {
  it('falls due a year after a refresh of a high risk customer', () => {
    expect(calendar.dueOn(refreshedOn, RiskRating.High)).toEqual(new Date('2027-10-28T08:00:00.000Z'));
  });

  it('falls due three years after a refresh of a medium risk customer', () => {
    expect(calendar.dueOn(refreshedOn, RiskRating.Medium)).toEqual(new Date('2029-10-28T08:00:00.000Z'));
  });

  it('falls due five years after a refresh of a low risk customer', () => {
    expect(calendar.dueOn(refreshedOn, RiskRating.Low)).toEqual(new Date('2031-10-28T08:00:00.000Z'));
  });

  it('falls due a year after a refresh of a customer never rated', () => {
    expect(calendar.dueOn(refreshedOn, undefined)).toEqual(new Date('2027-10-28T08:00:00.000Z'));
  });

  it('is not overdue on the day it falls due', () => {
    expect(calendar.isOverdue(refreshedOn, refreshedOn)).toBe(false);
  });

  it('is overdue once the day it falls due is past', () => {
    const dayAfter = new Date('2026-10-29T08:00:00.000Z');

    expect(calendar.isOverdue(refreshedOn, dayAfter)).toBe(true);
  });
});
