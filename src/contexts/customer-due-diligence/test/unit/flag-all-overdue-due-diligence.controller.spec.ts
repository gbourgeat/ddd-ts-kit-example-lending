import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { FlagAllOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.command';
import { FlagAllOverdueDueDiligenceController } from '@/contexts/customer-due-diligence/presentation/http/due-diligence/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.controller';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /due-diligence/flag-overdue', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(FlagAllOverdueDueDiligenceCommand, {
      execute: async () => 0,
    });

    const route = nestControllerRoute(FlagAllOverdueDueDiligenceController, {
      instanceOf: () => new FlagAllOverdueDueDiligenceController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { dueBefore: '2028-01-01T00:00:00.000Z' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/due-diligence/flag-overdue');
    expect(customerDueDiligenceControllers).toContain(FlagAllOverdueDueDiligenceController);
  });

  it('sends the instant of the body to the command', async () => {
    let sent: FlagAllOverdueDueDiligenceCommand | undefined;

    const commands = new InMemoryCommandBus().register(FlagAllOverdueDueDiligenceCommand, {
      execute: async (command: FlagAllOverdueDueDiligenceCommand) => {
        sent = command;

        return 0;
      },
    });

    const route = nestControllerRoute(FlagAllOverdueDueDiligenceController, {
      instanceOf: () => new FlagAllOverdueDueDiligenceController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { dueBefore: '2028-01-01T00:00:00.000Z' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(sent?.dueBefore).toEqual(new Date('2028-01-01T00:00:00.000Z'));
  });

  it('refuses a body whose instant is not an ISO date with 422', async () => {
    const commands = new InMemoryCommandBus().register(FlagAllOverdueDueDiligenceCommand, {
      execute: async () => 0,
    });

    const route = nestControllerRoute(FlagAllOverdueDueDiligenceController, {
      instanceOf: () => new FlagAllOverdueDueDiligenceController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { dueBefore: 'tomorrow' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
