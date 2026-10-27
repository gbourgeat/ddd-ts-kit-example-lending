import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DeclareDirectorsAndOwnersCommand } from '@/contexts/customer-due-diligence/application/commands/declare-directors-and-owners/declare-directors-and-owners.command';
import { DeclareDirectorsAndOwnersController } from '@/contexts/customer-due-diligence/presentation/http/customers/declare-directors-and-owners/declare-directors-and-owners.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /customers/:id/directors-and-owners', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(DeclareDirectorsAndOwnersCommand, {
      execute: async () => 'declare-directors-and-owners-1',
    });

    const route = nestControllerRoute(DeclareDirectorsAndOwnersController, {
      instanceOf: () => new DeclareDirectorsAndOwnersController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { directors: [], beneficialOwners: [] }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/customers/:id/directors-and-owners');
    expect(customerDueDiligenceControllers).toContain(DeclareDirectorsAndOwnersController);
  });

  it('refuses an input whose directors are not a list, with 422', async () => {
    const commands = new InMemoryCommandBus().register(DeclareDirectorsAndOwnersCommand, {
      execute: async () => 'unused',
    });

    const route = nestControllerRoute(DeclareDirectorsAndOwnersController, {
      instanceOf: () => new DeclareDirectorsAndOwnersController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { directors: 'not-a-list' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
