import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';
import type { SuspiciousActivityReportRepository } from '@/contexts/financial-crime/domain/repositories/suspicious-activity-report.repository';
import type { FinancialIntelligenceUnit } from '@/contexts/financial-crime/application/ports/financial-intelligence-unit.port';
import type { FileSuspiciousActivityReportCommand } from '@/contexts/financial-crime/application/commands/file-suspicious-activity-report/file-suspicious-activity-report.command';

export class FileSuspiciousActivityReportHandler implements CommandHandler<FileSuspiciousActivityReportCommand> {
  constructor(
    private readonly suspiciousActivityReportRepository: SuspiciousActivityReportRepository,
    private readonly financialIntelligenceUnit: FinancialIntelligenceUnit,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: FileSuspiciousActivityReportCommand): Promise<string> {
    const now = this.clock.now();
    const report = SuspiciousActivityReport.create(this.ids.next(), command.alertId, now);
    const filingReference = await this.tryToFile(command.alertId);

    if (filingReference !== undefined) {
      report.file(filingReference, now);
    }

    await this.suspiciousActivityReportRepository.save(report);

    return report.id;
  }

  /** Undefined while the financial intelligence unit is down: the report then stays pending, and is not lost. */
  private async tryToFile(subjectReference: string): Promise<string | undefined> {
    try {
      return await this.financialIntelligenceUnit.fileReport(subjectReference);
    } catch {
      return undefined;
    }
  }
}
