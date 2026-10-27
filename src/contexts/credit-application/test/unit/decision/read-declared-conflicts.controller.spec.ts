import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { ReadDeclaredConflictsController } from '@/contexts/credit-application/decision/presentation/http/applications/read-declared-conflicts/read-declared-conflicts.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /applications/:id/declared-conflicts', () => {
  it('answers 200 with the conflicts declared on the applicant, as the public fields', async () => {
    const queries = new InMemoryQueryBus().register(ReadDeclaredConflictsQuery, {
      execute: async () => ({
        conflicts: [{ conflictOfInterestId: 'conflict-1', staffMemberId: 'staff-1', customerId: 'ada', extra: 'x' }],
      }),
    });

    const response = await executeRoute(route(queries), request('application-1'), {
      validateResponses: true,
      resolvePrincipal: () => caller,
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      conflicts: [{ conflictOfInterestId: 'conflict-1', staffMemberId: 'staff-1', customerId: 'ada' }],
    });
  });

  it('reads the conflicts of the application the path names, for the caller', async () => {
    const sent: ReadDeclaredConflictsQuery[] = [];

    const queries = new InMemoryQueryBus().register(ReadDeclaredConflictsQuery, {
      execute: async (query: ReadDeclaredConflictsQuery) => {
        sent.push(query);

        return { conflicts: [] };
      },
    });

    await executeRoute(route(queries), request('application-1'), {
      validateResponses: true,
      resolvePrincipal: () => caller,
    });

    expect(sent).toMatchObject([{ applicationId: 'application-1', actor: caller }]);
  });

  it('is served by the controllers of the context', () => {
    expect(route(new InMemoryQueryBus()).path).toBe('/applications/:id/declared-conflicts');
    expect(creditApplicationControllers).toContain(ReadDeclaredConflictsController);
  });
});

function route(queries: InMemoryQueryBus) {
  return nestControllerRoute(ReadDeclaredConflictsController, {
    instanceOf: () => new ReadDeclaredConflictsController(queries),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });
}

function request(id: string) {
  return { params: { id }, query: {}, headers: {}, body: {}, raw: undefined };
}
