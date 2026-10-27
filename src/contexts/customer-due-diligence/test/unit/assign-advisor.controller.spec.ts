import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AssignAdvisorCommand } from '@/contexts/customer-due-diligence/application/commands/assign-advisor/assign-advisor.command';
import { AssignAdvisorController } from '@/contexts/customer-due-diligence/presentation/http/customers/assign-advisor/assign-advisor.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('PUT /customers/:id/advisor', () => {
  it('answers 200 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(AssignAdvisorCommand, {
      execute: async () => 'customer-1',
    });

    const route = nestControllerRoute(AssignAdvisorController, {
      instanceOf: () => new AssignAdvisorController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'customer-1' }, query: {}, headers: {}, body: { advisorId: 'advisor-1' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/customers/:id/advisor');
    expect(customerDueDiligenceControllers).toContain(AssignAdvisorController);
  });

  it('refuses an advisor that is blank, with 422', async () => {
    const commands = new InMemoryCommandBus().register(AssignAdvisorCommand, {
      execute: async () => 'unused',
    });

    const route = nestControllerRoute(AssignAdvisorController, {
      instanceOf: () => new AssignAdvisorController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'customer-1' }, query: {}, headers: {}, body: { advisorId: '' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
