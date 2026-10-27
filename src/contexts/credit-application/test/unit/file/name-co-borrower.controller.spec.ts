import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';
import { NameCoBorrowerController } from '@/contexts/credit-application/file/presentation/http/applications/name-co-borrower/name-co-borrower.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/co-borrowers', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(NameCoBorrowerCommand, {
      execute: async () => 'name-co-borrower-1',
    });

    const route = nestControllerRoute(NameCoBorrowerController, {
      instanceOf: () => new NameCoBorrowerController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/applications/:id/co-borrowers');
    expect(creditApplicationControllers).toContain(NameCoBorrowerController);
  });

  it('names the co-borrower the body gives, on the application the path names', async () => {
    const sent: NameCoBorrowerCommand[] = [];

    const commands = new InMemoryCommandBus().register(NameCoBorrowerCommand, {
      execute: async (command: NameCoBorrowerCommand) => {
        sent.push(command);

        return command.applicationId;
      },
    });

    const route = nestControllerRoute(NameCoBorrowerController, {
      instanceOf: () => new NameCoBorrowerController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    await executeRoute(
      route,
      { params: { id: 'application-1' }, query: {}, headers: {}, body: { coBorrowerId: 'customer-2' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(sent).toMatchObject([{ applicationId: 'application-1', coBorrowerId: 'customer-2' }]);
  });
});
