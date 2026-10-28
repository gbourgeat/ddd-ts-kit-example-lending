import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RecordLatePaymentCommand } from '@/contexts/servicing/instalments/application/commands/record-late-payment/record-late-payment.command';
import { RecordLatePaymentController } from '@/contexts/servicing/instalments/presentation/http/loans/record-late-payment/record-late-payment.controller';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /loans/:id/instalments/:number/payments', () => {
  it('answers 204 when the use case succeeds', async () => {
    const route = routeOf(
      new InMemoryCommandBus().register(RecordLatePaymentCommand, { execute: async () => undefined }),
    );

    const response = await executeRoute(
      route,
      { params: { id: 'id-1', number: '1' }, query: {}, headers: {}, body: { amountCents: 8_560 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/loans/:id/instalments/:number/payments');
    expect(servicingControllers).toContain(RecordLatePaymentController);
  });

  it('refuses an input that does not have the expected shape with 422', async () => {
    const route = routeOf(
      new InMemoryCommandBus().register(RecordLatePaymentCommand, { execute: async () => undefined }),
    );

    const response = await executeRoute(
      route,
      { params: { id: 'id-1', number: '1' }, query: {}, headers: {}, body: { amountCents: 'a lot' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('answers the documented status for each error code of the use case');
});

function routeOf(commands: InMemoryCommandBus) {
  return nestControllerRoute(RecordLatePaymentController, {
    instanceOf: () => new RecordLatePaymentController(commands),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });
}
