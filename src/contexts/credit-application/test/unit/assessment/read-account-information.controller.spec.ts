import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { ForbiddenError } from '@ddd-ts-kit/auth';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { ReadAccountInformationController } from '@/contexts/credit-application/assessment/presentation/http/applications/read-account-information/read-account-information.controller';
import { MissingAccountConsent } from '@/contexts/credit-application/file/domain/errors/missing-account-consent.error';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/account-information', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(ReadAccountInformationCommand, {
      execute: async () => 'read-account-information-1',
    });

    const route = nestControllerRoute(ReadAccountInformationController, {
      instanceOf: () => new ReadAccountInformationController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/applications/:id/account-information');
    expect(creditApplicationControllers).toContain(ReadAccountInformationController);
  });

  it('refuses an identifier that is not a string with 422, before the use case runs', async () => {
    const received: ReadAccountInformationCommand[] = [];

    const commands = new InMemoryCommandBus().register(ReadAccountInformationCommand, {
      execute: async (command: ReadAccountInformationCommand) => {
        received.push(command);

        return 'never';
      },
    });

    const route = nestControllerRoute(ReadAccountInformationController, {
      instanceOf: () => new ReadAccountInformationController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 42 as unknown as string }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
    expect(received).toEqual([]);
  });

  it('answers a refusal of the use case by its code: no consent, then an unknown application', async () => {
    const refusals = new Map<string, Error>([
      ['id-1', MissingAccountConsent.forApplication()],
      ['id-404', UnknownCreditApplication.forCreditApplication('id-404')],
    ]);

    const commands = new InMemoryCommandBus().register(ReadAccountInformationCommand, {
      execute: async (command: ReadAccountInformationCommand) => {
        throw refusals.get(command.applicationId) ?? new Error(`no refusal for ${command.applicationId}`);
      },
    });

    const route = nestControllerRoute(ReadAccountInformationController, {
      instanceOf: () => new ReadAccountInformationController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const withoutConsent = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    const unknown = await executeRoute(
      route,
      { params: { id: 'id-404' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(withoutConsent.body).toMatchObject({ code: 'MISSING_ACCOUNT_CONSENT' });
    expect(unknown.body).toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('refuses a caller who does not hold application.read-accounts with FORBIDDEN', async () => {
    const commands = new InMemoryCommandBus().register(ReadAccountInformationCommand, {
      execute: async () => {
        throw new ForbiddenError('credit-application:application.read-accounts', 'NOT_A_HOLDER');
      },
    });

    const route = nestControllerRoute(ReadAccountInformationController, {
      instanceOf: () => new ReadAccountInformationController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: 'FORBIDDEN' });
  });
});
