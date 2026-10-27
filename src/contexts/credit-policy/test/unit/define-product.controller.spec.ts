import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DefineProductCommand } from '@/contexts/credit-policy/application/commands/define-product/define-product.command';
import { DefineProductController } from '@/contexts/credit-policy/presentation/http/products/define-product/define-product.controller';
import { creditPolicyControllers } from '@/contexts/credit-policy/credit-policy.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const personalLoan = {
  amountMinimumCents: 100_000,
  amountMaximumCents: 2_500_000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4_500,
  insuranceMandatory: true,
  scoreThreshold: 600,
};

describe('POST /products', () => {
  it('answers 201 with the identifier of the defined product', async () => {
    const commands = new InMemoryCommandBus().register(DefineProductCommand, {
      execute: async () => 'product-1',
    });

    const response = await define(commands, personalLoan);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'product-1' });
  });

  it('hands the amounts, durations, fee, insurance and threshold of the body to the use case', async () => {
    const received: DefineProductCommand[] = [];

    const commands = new InMemoryCommandBus().register(DefineProductCommand, {
      execute: async (command: DefineProductCommand) => {
        received.push(command);

        return 'product-1';
      },
    });

    await define(commands, personalLoan);

    expect(received[0]?.terms).toEqual(personalLoan);
  });

  it('refuses a body that leaves out the score threshold with 422', async () => {
    const commands = new InMemoryCommandBus().register(DefineProductCommand, {
      execute: async () => 'product-1',
    });

    const { scoreThreshold: _left, ...withoutThreshold } = personalLoan;

    const response = await define(commands, withoutThreshold);

    expect(response.status).toBe(422);
  });

  it('is mounted on the route of the products of the context', () => {
    const route = nestControllerRoute(DefineProductController, {
      instanceOf: () => new DefineProductController(new InMemoryCommandBus()),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    expect(route.path).toBe('/products');
    expect(creditPolicyControllers).toContain(DefineProductController);
  });
});

async function define(commands: InMemoryCommandBus, body: Record<string, unknown>) {
  const route = nestControllerRoute(DefineProductController, {
    instanceOf: () => new DefineProductController(commands),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return executeRoute(
    route,
    { params: {}, query: {}, headers: {}, body, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => caller },
  );
}
