import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { IdentifyCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.command';
import { IdentifyCustomerController } from '@/contexts/customer-due-diligence/presentation/http/customers/identify-customer/identify-customer.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const identityBody = {
  documentKind: 'Passport',
  documentNumber: '12AB34567',
  issuingCountry: 'FR',
  documentExpiresOn: '2030-01-01T00:00:00.000Z',
  address: '1 rue de la Paix, 75002 Paris',
  addressProofDatedOn: '2026-05-01T00:00:00.000Z',
  name: 'Ada Lovelace',
  birthDate: '1980-05-01T00:00:00.000Z',
};

describe('POST /customers', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(IdentifyCustomerCommand, {
      execute: async () => 'identify-customer-1',
    });

    const route = nestControllerRoute(IdentifyCustomerController, {
      instanceOf: () => new IdentifyCustomerController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: identityBody, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/customers');
    expect(customerDueDiligenceControllers).toContain(IdentifyCustomerController);
  });

  it('refuses an identity document that is not a passport, a national identity card or a residence permit with 422', async () => {
    const commands = new InMemoryCommandBus().register(IdentifyCustomerCommand, {
      execute: async () => 'identify-customer-1',
    });

    const route = nestControllerRoute(IdentifyCustomerController, {
      instanceOf: () => new IdentifyCustomerController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { ...identityBody, documentKind: 'DrivingLicence' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
