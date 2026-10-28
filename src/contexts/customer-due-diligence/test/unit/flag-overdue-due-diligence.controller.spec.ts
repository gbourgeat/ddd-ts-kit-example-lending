import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { FlagOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-overdue-due-diligence/flag-overdue-due-diligence.command';
import { FlagOverdueDueDiligenceController } from '@/contexts/customer-due-diligence/presentation/http/customers/flag-overdue-due-diligence/flag-overdue-due-diligence.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /customers/:customerId/due-diligence/flag-overdue', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(FlagOverdueDueDiligenceCommand, {
      execute: async () => 'customer-1',
    });

    const route = nestControllerRoute(FlagOverdueDueDiligenceController, {
      instanceOf: () => new FlagOverdueDueDiligenceController(commands),
      // The route takes no body: a DTO without a decorated field accepts the empty object alone.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { customerId: 'customer-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/customers/:customerId/due-diligence/flag-overdue');
    expect(customerDueDiligenceControllers).toContain(FlagOverdueDueDiligenceController);
  });

  it('hands the customer of the path to the use case, as the compliance officer who flags it', async () => {
    const received: FlagOverdueDueDiligenceCommand[] = [];

    const commands = new InMemoryCommandBus().register(FlagOverdueDueDiligenceCommand, {
      execute: async (command: FlagOverdueDueDiligenceCommand) => {
        received.push(command);

        return command.customerId;
      },
    });

    const route = nestControllerRoute(FlagOverdueDueDiligenceController, {
      instanceOf: () => new FlagOverdueDueDiligenceController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    await executeRoute(
      route,
      { params: { customerId: 'customer-7' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(received.map((command) => command.customerId)).toEqual(['customer-7']);
    expect(received[0]?.actor.id).toBe('user-1');
  });
});
