import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { GetCustomerFileQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.query';
import { GetCustomerFileController } from '@/contexts/customer-due-diligence/presentation/http/customer-files/get-customer-file/get-customer-file.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /customer-files', () => {
  it('answers 200 when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(GetCustomerFileQuery, {
      execute: async () => ({
        items: [{ id: 'customer-1', identifiedAt: new Date('2026-01-01T00:00:00.000Z') }],
        total: 1,
      }),
    });

    const route = nestControllerRoute(GetCustomerFileController, {
      instanceOf: () => new GetCustomerFileController(queries),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/customer-files');
    expect(customerDueDiligenceControllers).toContain(GetCustomerFileController);
  });

  it('answers each file with the day its customer was identified, as an ISO date', async () => {
    const queries = new InMemoryQueryBus().register(GetCustomerFileQuery, {
      execute: async () => ({
        items: [{ id: 'customer-1', identifiedAt: new Date('2026-01-01T00:00:00.000Z') }],
        total: 1,
      }),
    });

    const route = nestControllerRoute(GetCustomerFileController, {
      instanceOf: () => new GetCustomerFileController(queries),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toMatchObject({ items: [{ id: 'customer-1', identifiedAt: '2026-01-01T00:00:00.000Z' }] });
  });

  it('refuses a page of more than 100 lines with 422', async () => {
    const queries = new InMemoryQueryBus().register(GetCustomerFileQuery, {
      execute: async () => ({ items: [], total: 0 }),
    });

    const route = nestControllerRoute(GetCustomerFileController, {
      instanceOf: () => new GetCustomerFileController(queries),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: { limit: '500' }, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
