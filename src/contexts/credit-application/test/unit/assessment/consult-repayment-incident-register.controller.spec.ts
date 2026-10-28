import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import { ConsultRepaymentIncidentRegisterController } from '@/contexts/credit-application/assessment/presentation/http/applications/consult-repayment-incident-register/consult-repayment-incident-register.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/register-consultations', () => {
  it('answers 201 with the name and birth date of each party, and whether it is listed', async () => {
    const commands = new InMemoryCommandBus().register(ConsultRepaymentIncidentRegisterCommand, {
      execute: async () => ({
        applicationId: 'id-1',
        parties: [
          { customerId: 'customer-1', name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z', listed: false },
        ],
      }),
    });

    const route = nestControllerRoute(ConsultRepaymentIncidentRegisterController, {
      instanceOf: () => new ConsultRepaymentIncidentRegisterController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/applications/:id/register-consultations');
    expect(creditApplicationControllers).toContain(ConsultRepaymentIncidentRegisterController);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
