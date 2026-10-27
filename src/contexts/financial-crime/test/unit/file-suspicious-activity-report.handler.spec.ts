import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import { FileSuspiciousActivityReportCommand } from '@/contexts/financial-crime/application/commands/file-suspicious-activity-report/file-suspicious-activity-report.command';
import { FileSuspiciousActivityReportHandler } from '@/contexts/financial-crime/application/commands/file-suspicious-activity-report/file-suspicious-activity-report.handler';
import type { FinancialIntelligenceUnit } from '@/contexts/financial-crime/application/ports/financial-intelligence-unit.port';
import { FakeFinancialIntelligenceUnit } from '@/contexts/financial-crime/test/fakes/financial-intelligence-unit.fake';
import { UnreachableFinancialIntelligenceUnit } from '@/contexts/financial-crime/test/fakes/unreachable-financial-intelligence-unit.fake';
import { FakeSuspiciousActivityReportRepository } from '@/contexts/financial-crime/test/fakes/suspicious-activity-report.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [financialCrimePermissions['report.file']] },
  }),
  map: AuthorizationMap.of(requires(FileSuspiciousActivityReportCommand, financialCrimePermissions['report.file'])),
});

const holder = anActor().withRole('holder').build();

describe('File suspicious activity report', () => {
  it('files the report with the financial intelligence unit and keeps its filing reference', async () => {
    const { commandBus, suspiciousActivityReportRepository } = arrange(new FakeFinancialIntelligenceUnit());

    const id = await commandBus.execute(new FileSuspiciousActivityReportCommand(holder, 'alert-1'));

    expect((await suspiciousActivityReportRepository.findById(id))?.filingReference).toBe('filing-1');
  });

  it('keeps the report pending, and answers its identifier, while the financial intelligence unit is down', async () => {
    const { commandBus, suspiciousActivityReportRepository } = arrange(new UnreachableFinancialIntelligenceUnit());

    const id = await commandBus.execute(new FileSuspiciousActivityReportCommand(holder, 'alert-1'));

    expect((await suspiciousActivityReportRepository.findById(id))?.filingReference).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission report.file', async () => {
    const { commandBus } = arrange(new FakeFinancialIntelligenceUnit());
    const command = new FileSuspiciousActivityReportCommand(anActor().build(), 'alert-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(financialIntelligenceUnit: FinancialIntelligenceUnit) {
  const { commandBus, clock, ids, dispatching } = createTestBuses({
    idPrefix: 'suspicious-activity-report',
  });

  // As the application hands it to the handler: the save announces the events of the report to `domainEvents`.
  const suspiciousActivityReportRepository = dispatching(new FakeSuspiciousActivityReportRepository());

  const handler = new FileSuspiciousActivityReportHandler(
    suspiciousActivityReportRepository,
    financialIntelligenceUnit,
    ids,
    clock,
  );

  commandBus.use(holders).register(FileSuspiciousActivityReportCommand, handler);

  return { commandBus, suspiciousActivityReportRepository };
}
