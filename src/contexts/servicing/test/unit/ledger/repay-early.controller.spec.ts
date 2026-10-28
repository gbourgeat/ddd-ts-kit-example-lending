import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RepayEarlyCommand } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.command';
import { RepayEarlyController } from '@/contexts/servicing/ledger/presentation/http/loans/repay-early/repay-early.controller';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /loans/:id/early-repayments', () => {
  it('answers 204 and hands the loan of the path to the use case with its capital', async () => {
    const received: RepayEarlyCommand[] = [];

    const commands = new InMemoryCommandBus().register(RepayEarlyCommand, {
      execute: async (command) => {
        received.push(command);
      },
    });

    const route = nestControllerRoute(RepayEarlyController, {
      instanceOf: () => new RepayEarlyController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'loan-1' }, query: {}, headers: {}, body: { capitalCents: 1000 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/loans/:id/early-repayments');
    expect(received).toMatchObject([{ loanId: 'loan-1' }]);
    expect(servicingControllers).toContain(RepayEarlyController);
  });

  it('refuses a capital that is not a whole number of cents with 422', async () => {
    const commands = new InMemoryCommandBus();

    const route = nestControllerRoute(RepayEarlyController, {
      instanceOf: () => new RepayEarlyController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'loan-1' }, query: {}, headers: {}, body: { capitalCents: 1.5 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers the documented problem when the loan is unknown', async () => {
    const commands = new InMemoryCommandBus().register(RepayEarlyCommand, {
      execute: async () => {
        throw UnknownLoan.forLoan('loan-1');
      },
    });

    const route = nestControllerRoute(RepayEarlyController, {
      instanceOf: () => new RepayEarlyController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'loan-1' }, query: {}, headers: {}, body: { capitalCents: 1000 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toMatchObject({ code: 'UNKNOWN_LOAN' });
  });
});
