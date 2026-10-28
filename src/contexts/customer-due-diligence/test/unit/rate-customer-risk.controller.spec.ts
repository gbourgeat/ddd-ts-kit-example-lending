import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RateCustomerRiskCommand } from '@/contexts/customer-due-diligence/application/commands/rate-customer-risk/rate-customer-risk.command';
import { RateCustomerRiskController } from '@/contexts/customer-due-diligence/presentation/http/customers/rate-customer-risk/rate-customer-risk.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('PUT /customers/:id/risk', () => {
  it('answers 200 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(RateCustomerRiskCommand, {
      execute: async () => 'rate-customer-risk-1',
    });

    const route = nestControllerRoute(RateCustomerRiskController, {
      instanceOf: () => new RateCustomerRiskController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { rating: 'low' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/customers/:id/risk');
    expect(customerDueDiligenceControllers).toContain(RateCustomerRiskController);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
