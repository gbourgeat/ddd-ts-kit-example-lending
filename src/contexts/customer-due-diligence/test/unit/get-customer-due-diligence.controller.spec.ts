import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { GetCustomerDueDiligenceQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.query';
import { GetCustomerDueDiligenceController } from '@/contexts/customer-due-diligence/presentation/http/customers/get-customer-due-diligence/get-customer-due-diligence.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /customers/:id/due-diligence', () => {
  it('answers 200 when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(GetCustomerDueDiligenceQuery, {
      execute: async () => ({ customerId: 'id-1' }),
    });

    const route = nestControllerRoute(GetCustomerDueDiligenceController, {
      instanceOf: () => new GetCustomerDueDiligenceController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/customers/:id/due-diligence');
    expect(customerDueDiligenceControllers).toContain(GetCustomerDueDiligenceController);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
