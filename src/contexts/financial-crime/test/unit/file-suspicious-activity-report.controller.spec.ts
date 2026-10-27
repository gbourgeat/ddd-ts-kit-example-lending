import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { FileSuspiciousActivityReportCommand } from '@/contexts/financial-crime/application/commands/file-suspicious-activity-report/file-suspicious-activity-report.command';
import { FileSuspiciousActivityReportController } from '@/contexts/financial-crime/presentation/http/alerts/file-suspicious-activity-report/file-suspicious-activity-report.controller';
import { financialCrimeControllers } from '@/contexts/financial-crime/financial-crime.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /alerts/:id/reports', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(FileSuspiciousActivityReportCommand, {
      execute: async () => 'file-suspicious-activity-report-1',
    });

    const route = nestControllerRoute(FileSuspiciousActivityReportController, {
      instanceOf: () => new FileSuspiciousActivityReportController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/alerts/:id/reports');
    expect(financialCrimeControllers).toContain(FileSuspiciousActivityReportController);
  });

  it('files the report about the alert named in the route, for the caller', async () => {
    const sent: FileSuspiciousActivityReportCommand[] = [];

    const commands = new InMemoryCommandBus().register(FileSuspiciousActivityReportCommand, {
      execute: async (command: FileSuspiciousActivityReportCommand) => {
        sent.push(command);

        return 'file-suspicious-activity-report-1';
      },
    });

    const controller = new FileSuspiciousActivityReportController(commands);

    await controller.fileSuspiciousActivityReport({ id: 'alert-42' }, caller);

    expect(sent).toHaveLength(1);
    expect(sent[0]?.alertId).toBe('alert-42');
  });
});
