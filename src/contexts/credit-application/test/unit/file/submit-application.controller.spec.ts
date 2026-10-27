import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { SubmitApplicationCommand } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.command';
import { SubmitApplicationController } from '@/contexts/credit-application/file/presentation/http/applications/submit-application/submit-application.controller';
import { InvalidAmount } from '@/contexts/credit-application/file/domain/errors/invalid-amount.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'customer-1', type: 'user', roles: [], attributes: {} };
const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };

describe('POST /applications', () => {
  it('answers 201 with the Location of the application and its amount in whole cents', async () => {
    const commands = new InMemoryCommandBus().register(SubmitApplicationCommand, {
      execute: async () => 'credit-application-1',
    });

    const response = await submit(commands, request);

    expect(response.status).toBe(201);
    expect(response.headers).toMatchObject({ location: '/applications/credit-application-1' });

    expect(response.body).toEqual({
      id: 'credit-application-1',
      amount: { cents: 1234567, currency: 'EUR' },
    });

    expect(creditApplicationControllers).toContain(SubmitApplicationController);
  });

  it('refuses a body that carries no amount, before the use case runs, with 422', async () => {
    const commands = new InMemoryCommandBus().register(SubmitApplicationCommand, {
      execute: async () => 'credit-application-1',
    });

    const response = await submit(commands, { productId: 'personal-loan', durationMonths: 60 });

    expect(response.status).toBe(422);
  });

  it('answers the refusal code of an amount that is not a positive whole number of cents', async () => {
    const commands = new InMemoryCommandBus().register(SubmitApplicationCommand, {
      execute: async () => {
        throw InvalidAmount.forCents(0);
      },
    });

    const response = await submit(commands, { ...request, amount: { cents: 0, currency: 'EUR' } });

    expect(response.body).toMatchObject({ code: 'INVALID_AMOUNT' });
  });
});

async function submit(commands: InMemoryCommandBus, body: unknown) {
  const route = nestControllerRoute(SubmitApplicationController, {
    instanceOf: () => new SubmitApplicationController(commands),
    schemaOfClass: (dto) => classSchema(dto),
  });

  return executeRoute(
    route,
    { params: {}, query: {}, headers: {}, body, raw: undefined },
    {
      validateResponses: true,
      resolvePrincipal: () => caller,
    },
  );
}
