import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReverseWriteOffCommand } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.command';
import { ReverseWriteOffController } from '@/contexts/servicing/ledger/presentation/http/loans/reverse-write-off/reverse-write-off.controller';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /loans/:id/write-off-reversal', () => {
  it('answers 204 and hands the loan of the path to the use case', async () => {
    const received: ReverseWriteOffCommand[] = [];

    const commands = new InMemoryCommandBus().register(ReverseWriteOffCommand, {
      execute: async (command) => {
        received.push(command);
      },
    });

    const route = nestControllerRoute(ReverseWriteOffController, {
      instanceOf: () => new ReverseWriteOffController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'loan-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/loans/:id/write-off-reversal');
    expect(received).toMatchObject([{ loanId: 'loan-1' }]);
    expect(servicingControllers).toContain(ReverseWriteOffController);
  });

  it('answers the documented problem when the loan is unknown', async () => {
    const commands = new InMemoryCommandBus().register(ReverseWriteOffCommand, {
      execute: async () => {
        throw UnknownLoan.forLoan('loan-1');
      },
    });

    const route = nestControllerRoute(ReverseWriteOffController, {
      instanceOf: () => new ReverseWriteOffController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'loan-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toMatchObject({ code: 'UNKNOWN_LOAN' });
  });
});
