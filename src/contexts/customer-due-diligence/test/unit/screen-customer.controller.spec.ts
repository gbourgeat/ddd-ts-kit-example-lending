import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ScreenCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/screen-customer/screen-customer.command';
import { ScreenCustomerController } from '@/contexts/customer-due-diligence/presentation/http/customers/screen-customer/screen-customer.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /customers/:id/screening', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(ScreenCustomerCommand, {
      execute: async () => 'customer-1',
    });

    const route = nestControllerRoute(ScreenCustomerController, {
      instanceOf: () => new ScreenCustomerController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'customer-1' },
        query: {},
        headers: {},
        body: { name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/customers/:id/screening');
    expect(customerDueDiligenceControllers).toContain(ScreenCustomerController);
  });

  it('refuses a screening without the name of the person, with 422', async () => {
    const commands = new InMemoryCommandBus().register(ScreenCustomerCommand, {
      execute: async () => 'unused',
    });

    const route = nestControllerRoute(ScreenCustomerController, {
      instanceOf: () => new ScreenCustomerController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'customer-1' },
        query: {},
        headers: {},
        body: { name: '', birthDate: '1980-05-01T00:00:00.000Z' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
