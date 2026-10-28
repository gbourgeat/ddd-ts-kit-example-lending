import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { PublishRateGridCommand } from '@/contexts/credit-policy/application/commands/publish-rate-grid/publish-rate-grid.command';
import { PublishRateGridController } from '@/contexts/credit-policy/presentation/http/rate-grids/publish-rate-grid/publish-rate-grid.controller';
import type { PublishRateGridBody } from '@/contexts/credit-policy/presentation/http/rate-grids/publish-rate-grid/publish-rate-grid.body';
import { creditPolicyControllers } from '@/contexts/credit-policy/credit-policy.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /rate-grids', () => {
  it('answers 201 with the identifier of the published rate grid', async () => {
    const commands = new InMemoryCommandBus().register(PublishRateGridCommand, {
      execute: async () => 'rate-grid-1',
    });

    const response = await publish(commands, { productId: 'product-1', effectiveFrom: '2026-11-01', rates: [] });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'rate-grid-1' });
  });

  it('hands the product and the day of effect of the body to the use case', async () => {
    const received: PublishRateGridCommand[] = [];

    const commands = new InMemoryCommandBus().register(PublishRateGridCommand, {
      execute: async (command: PublishRateGridCommand) => {
        received.push(command);

        return 'rate-grid-1';
      },
    });

    await publish(commands, { productId: 'product-1', effectiveFrom: '2026-11-01', rates: [] });

    expect(received[0]?.productId).toBe('product-1');
    expect(received[0]?.effectiveFrom).toEqual(new Date('2026-11-01'));
  });

  it('refuses a body whose day of effect is not a date with 422', async () => {
    const commands = new InMemoryCommandBus().register(PublishRateGridCommand, {
      execute: async () => 'rate-grid-1',
    });

    const response = await publish(commands, { productId: 'product-1', effectiveFrom: 'next tuesday', rates: [] });

    expect(response.status).toBe(422);
  });

  it('is mounted on the route of the rate grids of the context', () => {
    const route = nestControllerRoute(PublishRateGridController, {
      instanceOf: () => new PublishRateGridController(new InMemoryCommandBus()),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    expect(route.path).toBe('/rate-grids');
    expect(creditPolicyControllers).toContain(PublishRateGridController);
  });
});

async function publish(commands: InMemoryCommandBus, body: PublishRateGridBody) {
  const route = nestControllerRoute(PublishRateGridController, {
    instanceOf: () => new PublishRateGridController(commands),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return executeRoute(
    route,
    { params: {}, query: {}, headers: {}, body, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => caller },
  );
}
