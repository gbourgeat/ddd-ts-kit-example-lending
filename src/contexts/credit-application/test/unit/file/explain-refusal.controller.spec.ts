import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ExplainRefusalQuery } from '@/contexts/credit-application/file/application/queries/explain-refusal/explain-refusal.query';
import { ExplainRefusalController } from '@/contexts/credit-application/file/presentation/http/applications/explain-refusal/explain-refusal.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /applications/:id/access-explanation', () => {
  it('answers 200 with the outcome visible when the application may be read', async () => {
    const queries = new InMemoryQueryBus().register(ExplainRefusalQuery, {
      execute: async () => ({ outcome: 'visible' as const }),
    });

    const route = nestControllerRoute(ExplainRefusalController, {
      instanceOf: () => new ExplainRefusalController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ outcome: 'visible' });
    expect(route.path).toBe('/applications/:id/access-explanation');
    expect(creditApplicationControllers).toContain(ExplainRefusalController);
  });
});
