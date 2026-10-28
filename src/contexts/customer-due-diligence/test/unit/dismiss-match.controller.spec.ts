import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DismissMatchCommand } from '@/contexts/customer-due-diligence/application/commands/dismiss-match/dismiss-match.command';
import { DismissMatchController } from '@/contexts/customer-due-diligence/presentation/http/customers/dismiss-match/dismiss-match.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /customers/:id/matches/dismiss', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(DismissMatchCommand, {
      execute: async () => 'dismiss-match-1',
    });

    const route = nestControllerRoute(DismissMatchController, {
      instanceOf: () => new DismissMatchController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { reason: 'Another Ada Lovelace' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/customers/:id/matches/dismiss');
    expect(customerDueDiligenceControllers).toContain(DismissMatchController);
  });

  it('refuses a body whose reason is not a string with 422, before the use case runs', async () => {
    const commands = new InMemoryCommandBus().register(DismissMatchCommand, {
      execute: async () => 'dismiss-match-1',
    });

    const route = nestControllerRoute(DismissMatchController, {
      instanceOf: () => new DismissMatchController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { reason: 42 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
