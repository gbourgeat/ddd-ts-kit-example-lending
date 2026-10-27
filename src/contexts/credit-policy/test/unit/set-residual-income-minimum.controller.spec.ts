import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { SetResidualIncomeMinimumCommand } from '@/contexts/credit-policy/application/commands/set-residual-income-minimum/set-residual-income-minimum.command';
import { SetResidualIncomeMinimumController } from '@/contexts/credit-policy/presentation/http/residual-income-minimums/set-residual-income-minimum/set-residual-income-minimum.controller';
import { creditPolicyControllers } from '@/contexts/credit-policy/credit-policy.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const validBody = {
  perAdultInCents: 80_000,
  perChildInCents: 30_000,
};

describe('PUT /residual-income-minimums', () => {
  it('answers with the minimum identifier and hands the amounts per adult and per child of the body to the use case', async () => {
    const received: SetResidualIncomeMinimumCommand[] = [];

    const commands = new InMemoryCommandBus().register(SetResidualIncomeMinimumCommand, {
      execute: async (command: SetResidualIncomeMinimumCommand) => {
        received.push(command);

        return 'residual-income-minimum-1';
      },
    });

    const route = nestControllerRoute(SetResidualIncomeMinimumController, {
      instanceOf: () => new SetResidualIncomeMinimumController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: validBody, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/residual-income-minimums');
    expect(received[0]?.perAdultInCents).toBe(80_000);
    expect(received[0]?.perChildInCents).toBe(30_000);
    expect(creditPolicyControllers).toContain(SetResidualIncomeMinimumController);
  });

  it('refuses a body without its amounts with 422, before the use case runs', async () => {
    const commands = new InMemoryCommandBus().register(SetResidualIncomeMinimumCommand, {
      execute: async () => 'never-called',
    });

    const route = nestControllerRoute(SetResidualIncomeMinimumController, {
      instanceOf: () => new SetResidualIncomeMinimumController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { perAdultInCents: 80_000 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
