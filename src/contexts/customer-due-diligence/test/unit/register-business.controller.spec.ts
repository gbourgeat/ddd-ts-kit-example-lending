import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { RegisterBusinessCommand } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.command';
import { RegisterBusinessController } from '@/contexts/customer-due-diligence/presentation/http/businesses/register-business/register-business.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const validBody = {
  customerId: 'customer-1',
  legalName: 'Boulangerie Dupont SARL',
  registrationNumber: 'RC-75-123',
  countryOfRegistration: 'FR',
  registeredOn: '2026-02-14',
};

describe('POST /businesses', () => {
  it('answers 201 with the identifier of the customer, and sends the registration as the body says', async () => {
    const { route, sent } = arrange();

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: validBody, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'customer-1' });

    expect(sent).toMatchObject([
      { customerId: 'customer-1', legalName: 'Boulangerie Dupont SARL', registrationNumber: 'RC-75-123' },
    ]);

    expect(route.path).toBe('/businesses');
    expect(customerDueDiligenceControllers).toContain(RegisterBusinessController);
  });

  it('refuses with 422 a request without the identifier of the customer, and sends nothing', async () => {
    const { route, sent } = arrange();
    const { customerId: _omitted, ...withoutCustomer } = validBody;

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: withoutCustomer, raw: undefined },
      { resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
    expect(sent).toEqual([]);
  });

  it('refuses with 422 a registration date that is not a date, and sends nothing', async () => {
    const { route, sent } = arrange();

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { ...validBody, registeredOn: 'yesterday' }, raw: undefined },
      { resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
    expect(sent).toEqual([]);
  });
});

/** The route, on a bus that keeps what it was sent and answers as the use case would. */
function arrange() {
  const sent: RegisterBusinessCommand[] = [];

  const commands = new InMemoryCommandBus().register(RegisterBusinessCommand, {
    execute: async (command) => {
      sent.push(command);

      return command.customerId;
    },
  });

  const route = nestControllerRoute(RegisterBusinessController, {
    instanceOf: () => new RegisterBusinessController(commands),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return { route, sent };
}
