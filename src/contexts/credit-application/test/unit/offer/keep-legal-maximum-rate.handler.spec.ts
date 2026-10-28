import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf, type Actor } from '@ddd-ts-kit/kernel';
import { legalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';
import { KeepLegalMaximumRateHandler } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.handler';
import { legalMaximumRateRowOf } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate-row-of.projection';
import { FakeLegalMaximumRates } from '@/contexts/credit-application/test/fakes/legal-maximum-rates.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['legal-maximum-rate.keep']] },
  }),
  map: AuthorizationMap.of(
    requires(KeepLegalMaximumRateCommand, creditApplicationPermissions['legal-maximum-rate.keep']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Keep legal maximum rate', () => {
  it('keeps the legal maximum rate in the read model', async () => {
    const { commandBus, rates } = arrange();

    await commandBus.execute(keepCommand(holder, publishedRate('maximum-1', 1250, '2026-01-01T00:00:00.000Z')));

    expect(await rates.get('maximum-1')).toMatchObject({
      legalMaximumRateId: 'maximum-1',
      category: 'car',
      rateBasisPoints: 1250,
    });
  });

  it('keeps the same maximum when the same event is delivered twice', async () => {
    const { commandBus, rates } = arrange();
    const command = keepCommand(holder, publishedRate('maximum-1', 1250, '2026-01-01T00:00:00.000Z'));

    await commandBus.execute(command);
    await commandBus.execute(command);

    expect(await rates.get('maximum-1')).toMatchObject({ rateBasisPoints: 1250 });
  });

  it('keeps the newest maximum when an older one arrives late', async () => {
    const { commandBus, rates } = arrange();

    await commandBus.execute(keepCommand(holder, publishedRate('maximum-1', 1300, '2026-02-01T00:00:00.000Z')));
    await commandBus.execute(keepCommand(holder, publishedRate('maximum-1', 1250, '2026-01-01T00:00:00.000Z')));

    expect(await rates.get('maximum-1')).toMatchObject({ rateBasisPoints: 1300 });
  });

  it('is refused to an actor who does not hold the permission legal-maximum-rate.keep, and keeps nothing', async () => {
    const { commandBus, rates } = arrange();
    const command = keepCommand(anActor().build(), publishedRate('maximum-1', 1250, '2026-01-01T00:00:00.000Z'));

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await rates.get('maximum-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const rates = new FakeLegalMaximumRates();

  commandBus.use(holders).register(KeepLegalMaximumRateCommand, new KeepLegalMaximumRateHandler(rates));

  return { commandBus, rates };
}

function publishedRate(legalMaximumRateId: string, rateBasisPoints: number, occurredAt: string) {
  return legalMaximumRatePublishedV2.create(
    { legalMaximumRateId, category: 'car', rateBasisPoints, effectiveFrom: '2026-01-01' },
    { id: `event-${legalMaximumRateId}-${occurredAt}`, occurredAt },
  );
}

function keepCommand(actor: Actor, event: ReturnType<typeof publishedRate>): KeepLegalMaximumRateCommand {
  return new KeepLegalMaximumRateCommand(actor, legalMaximumRateRowOf(event.payload), stampOf(event));
}
