import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestHumanReviewCommand } from '@/contexts/credit-application/decision/application/commands/request-human-review/request-human-review.command';
import { RequestHumanReviewController } from '@/contexts/credit-application/decision/presentation/http/applications/request-human-review/request-human-review.controller';
import { HumanReviewNotAvailable } from '@/contexts/credit-application/file/domain/errors/human-review-not-available.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/human-review', () => {
  it('answers 204 when the applicant asks for the review', async () => {
    const commands = new InMemoryCommandBus().register(RequestHumanReviewCommand, {
      execute: async () => undefined,
    });

    const response = await executeRoute(routeOf(commands), requestOf(), {
      validateResponses: true,
      resolvePrincipal: () => caller,
    });

    expect(response.status).toBe(204);
    expect(routeOf(commands).path).toBe('/applications/:id/human-review');
    expect(creditApplicationControllers).toContain(RequestHumanReviewController);
  });

  it('answers the refusal of the review with its code and a client error status', async () => {
    const commands = new InMemoryCommandBus().register(RequestHumanReviewCommand, {
      execute: async () => {
        throw HumanReviewNotAvailable.forHumanReviewNotAvailable();
      },
    });

    const response = await executeRoute(routeOf(commands), requestOf(), {
      validateResponses: true,
      resolvePrincipal: () => caller,
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'HUMAN_REVIEW_NOT_AVAILABLE' });
  });
});

function routeOf(commands: InMemoryCommandBus) {
  return nestControllerRoute(RequestHumanReviewController, {
    instanceOf: () => new RequestHumanReviewController(commands),
    schemaOfClass: (dto) => classSchema(dto),
  });
}

function requestOf() {
  return { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined };
}
