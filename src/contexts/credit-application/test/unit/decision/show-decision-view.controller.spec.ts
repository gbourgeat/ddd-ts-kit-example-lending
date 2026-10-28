import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ShowDecisionViewQuery } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.query';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';
import { ShowDecisionViewController } from '@/contexts/credit-application/decision/presentation/http/applications/show-decision-view/show-decision-view.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const view: ShowDecisionViewResult = {
  applicationId: 'application-1',
  decision: {
    outcome: 'approve',
    deciderId: 'advisor-1',
    level: 'advisor',
    reasons: '',
    conditions: '',
    approvedAmountCents: 1_000_000,
    branchId: 'branch-1',
    exception: false,
    decidedAt: new Date('2026-03-03T10:00:00.000Z'),
  },
  assessment: undefined,
  register: undefined,
  refusalReview: undefined,
};

describe('GET /applications/:id/decision-view', () => {
  it('answers 200 with the decision as the public fields, the instant as ISO 8601 text', async () => {
    const response = await executeRoute(route(answering(view)), request('application-1'), {
      validateResponses: true,
      resolvePrincipal: () => caller,
    });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      applicationId: 'application-1',
      decision: { outcome: 'approve', deciderId: 'advisor-1', decidedAt: '2026-03-03T10:00:00.000Z' },
    });
  });

  it('reads the view of the application the path names, for the caller', async () => {
    const sent: ShowDecisionViewQuery[] = [];

    await executeRoute(route(answering(view, sent)), request('application-1'), {
      validateResponses: true,
      resolvePrincipal: () => caller,
    });

    expect(sent).toMatchObject([{ applicationId: 'application-1', actor: caller }]);
  });

  it('is served by the controllers of the context', () => {
    expect(route(new InMemoryQueryBus()).path).toBe('/applications/:id/decision-view');
    expect(creditApplicationControllers).toContain(ShowDecisionViewController);
  });
});

function answering(answer: ShowDecisionViewResult, sent: ShowDecisionViewQuery[] = []): InMemoryQueryBus {
  return new InMemoryQueryBus().register(ShowDecisionViewQuery, {
    execute: async (query: ShowDecisionViewQuery) => {
      sent.push(query);

      return answer;
    },
  });
}

function route(queries: InMemoryQueryBus) {
  return nestControllerRoute(ShowDecisionViewController, {
    instanceOf: () => new ShowDecisionViewController(queries),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });
}

function request(id: string) {
  return { params: { id }, query: {}, headers: {}, body: {}, raw: undefined };
}
