import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { WithdrawLoanCommand } from '@/contexts/credit-application/offer/application/commands/withdraw-loan/withdraw-loan.command';
import { WithdrawLoanController } from '@/contexts/credit-application/offer/presentation/http/applications/withdraw-loan/withdraw-loan.controller';
import { WithdrawalExpired } from '@/contexts/credit-application/offer/domain/errors/withdrawal-expired.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/withdrawal', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(WithdrawLoanCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(WithdrawLoanController, {
      instanceOf: () => new WithdrawLoanController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/applications/:id/withdrawal');
    expect(creditApplicationControllers).toContain(WithdrawLoanController);
  });

  it('answers the refusal of the use case with its code, not a success', async () => {
    const commands = new InMemoryCommandBus().register(WithdrawLoanCommand, {
      execute: async () => {
        throw WithdrawalExpired.forExpiry(new Date('2026-04-16T09:00:00.000Z'));
      },
    });

    const route = nestControllerRoute(WithdrawLoanController, {
      instanceOf: () => new WithdrawLoanController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'WITHDRAWAL_EXPIRED' });
  });
});
