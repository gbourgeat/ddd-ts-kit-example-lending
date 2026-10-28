import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf } from '@ddd-ts-kit/kernel';
import { legalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadLegalMaximumRateHandler } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.handler';
import { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';
import { legalMaximumRateRowOf } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate-row-of.projection';
import { FakeLegalMaximumRates } from '@/contexts/credit-application/test/fakes/legal-maximum-rates.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(ReadLegalMaximumRateQuery, creditApplicationPermissions['application.decide'])),
});

const holder = anActor().withRole('holder').build();

describe('Read legal maximum rate', () => {
  it('answers the category, the rate and the day the maximum takes effect', async () => {
    const rates = new FakeLegalMaximumRates();

    await keep(rates, 'maximum-1');
    const queryBus = arrange(rates);

    const answer = await queryBus.execute(new ReadLegalMaximumRateQuery(holder, 'maximum-1'));

    expect(answer).toEqual({
      legalMaximumRateId: 'maximum-1',
      category: 'car',
      rateBasisPoints: 1250,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
    });
  });

  it('answers the maximum asked for, not another one that is kept', async () => {
    const rates = new FakeLegalMaximumRates();

    await keep(rates, 'maximum-1');
    await keep(rates, 'maximum-2');
    const queryBus = arrange(rates);

    const answer = await queryBus.execute(new ReadLegalMaximumRateQuery(holder, 'maximum-2'));

    expect(answer.legalMaximumRateId).toBe('maximum-2');
  });

  it('refuses to answer a legal maximum rate that was never published with UNKNOWN_LEGAL_MAXIMUM_RATE', async () => {
    const queryBus = arrange(new FakeLegalMaximumRates());

    await expect(queryBus.execute(new ReadLegalMaximumRateQuery(holder, 'maximum-9'))).rejects.toMatchObject({
      code: 'UNKNOWN_LEGAL_MAXIMUM_RATE',
    });
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const queryBus = arrange(new FakeLegalMaximumRates());
    const query = new ReadLegalMaximumRateQuery(anActor().build(), 'maximum-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(rates: FakeLegalMaximumRates) {
  const { queryBus } = createTestBuses();

  return queryBus.use(holders).register(ReadLegalMaximumRateQuery, new ReadLegalMaximumRateHandler(rates));
}

async function keep(rates: FakeLegalMaximumRates, legalMaximumRateId: string): Promise<void> {
  const event = legalMaximumRatePublishedV2.create(
    { legalMaximumRateId, category: 'car', rateBasisPoints: 1250, effectiveFrom: '2026-01-01T00:00:00.000Z' },
    { id: `event-${legalMaximumRateId}`, occurredAt: '2026-01-01T00:00:00.000Z' },
  );

  await rates.upsertIfNewer(legalMaximumRateId, stampOf(event), () => legalMaximumRateRowOf(event.payload));
}
