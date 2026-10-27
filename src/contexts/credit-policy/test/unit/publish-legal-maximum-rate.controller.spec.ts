import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { PublishLegalMaximumRateCommand } from '@/contexts/credit-policy/application/commands/publish-legal-maximum-rate/publish-legal-maximum-rate.command';
import { PublishLegalMaximumRateController } from '@/contexts/credit-policy/presentation/http/legal-maximum-rates/publish-legal-maximum-rate/publish-legal-maximum-rate.controller';
import { creditPolicyControllers } from '@/contexts/credit-policy/credit-policy.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };
const validBody = { category: 'car', rateBasisPoints: 1450, effectiveFrom: '2026-07-01' };

describe('POST /legal-maximum-rates', () => {
  it('answers 201 and hands the rate of the body to the use case', async () => {
    const received: PublishLegalMaximumRateCommand[] = [];

    const commands = new InMemoryCommandBus().register(PublishLegalMaximumRateCommand, {
      execute: async (command: PublishLegalMaximumRateCommand) => {
        received.push(command);

        return 'legal-maximum-rate-1';
      },
    });

    const route = nestControllerRoute(PublishLegalMaximumRateController, {
      instanceOf: () => new PublishLegalMaximumRateController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: validBody, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/legal-maximum-rates');
    expect(received[0]?.terms.category).toBe('car');
    expect(received[0]?.terms.rateBasisPoints).toBe(1450);
    expect(creditPolicyControllers).toContain(PublishLegalMaximumRateController);
  });

  it('refuses a body without its rate with 422, before the use case runs', async () => {
    const commands = new InMemoryCommandBus().register(PublishLegalMaximumRateCommand, {
      execute: async () => 'never-called',
    });

    const route = nestControllerRoute(PublishLegalMaximumRateController, {
      instanceOf: () => new PublishLegalMaximumRateController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { category: 'car' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
