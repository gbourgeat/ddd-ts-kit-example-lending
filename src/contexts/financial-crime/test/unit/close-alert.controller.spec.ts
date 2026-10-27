import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CloseAlertCommand } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.command';
import { CloseAlertController } from '@/contexts/financial-crime/presentation/http/alerts/close-alert/close-alert.controller';
import { financialCrimeControllers } from '@/contexts/financial-crime/financial-crime.controllers';
import { AlertAlreadyClosed } from '@/contexts/financial-crime/domain/errors/alert-already-closed.error';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /alerts/:id/closure', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(CloseAlertCommand, {
      execute: async () => 'close-alert-1',
    });

    const route = nestControllerRoute(CloseAlertController, {
      instanceOf: () => new CloseAlertController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { reason: 'Reviewed' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/alerts/:id/closure');
    expect(financialCrimeControllers).toContain(CloseAlertController);
  });

  it('refuses a reason that is not a text, with the status of a validation error', async () => {
    const commands = new InMemoryCommandBus().register(CloseAlertCommand, { execute: async () => 'unused' });

    const route = nestControllerRoute(CloseAlertController, {
      instanceOf: () => new CloseAlertController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'alert-1' }, query: {}, headers: {}, body: { reason: 12 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers the code ALERT_ALREADY_CLOSED when the alert was closed before', async () => {
    const commands = new InMemoryCommandBus().register(CloseAlertCommand, {
      execute: async () => {
        throw AlertAlreadyClosed.forAlert();
      },
    });

    const route = nestControllerRoute(CloseAlertController, {
      instanceOf: () => new CloseAlertController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'alert-1' }, query: {}, headers: {}, body: { reason: 'Reviewed' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toMatchObject({ code: 'ALERT_ALREADY_CLOSED' });
  });
});
