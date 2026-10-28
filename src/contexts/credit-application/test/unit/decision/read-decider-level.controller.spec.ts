import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import { ReadDeciderLevelController } from '@/contexts/credit-application/decision/presentation/http/deciders/read-decider-level/read-decider-level.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /deciders/:staffMemberId/level', () => {
  it('answers 200 with the level of the staff member the use case found', async () => {
    const queries = new InMemoryQueryBus().register(ReadDeciderLevelQuery, {
      execute: async () => ({ staffMemberId: 'staff-member-id-1', branchId: 'branch-1', level: 'level-2' }),
    });

    const route = nestControllerRoute(ReadDeciderLevelController, {
      instanceOf: () => new ReadDeciderLevelController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { staffMemberId: 'staff-member-id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ staffMemberId: 'staff-member-id-1', branchId: 'branch-1', level: 'level-2' });
    expect(route.path).toBe('/deciders/:staffMemberId/level');
    expect(creditApplicationControllers).toContain(ReadDeciderLevelController);
  });

  // TODO(domain): replace the entry below by a test of the contract a client relies on: an input that does not have the expected shape is refused with 422.
  it.todo('refuses an input that does not have the expected shape with 422');
});
