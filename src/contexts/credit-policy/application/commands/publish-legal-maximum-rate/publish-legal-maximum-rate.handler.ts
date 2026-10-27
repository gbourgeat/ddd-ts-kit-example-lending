import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import type { LegalMaximumRateRepository } from '@/contexts/credit-policy/domain/repositories/legal-maximum-rate.repository';
import { LegalMaximumRateScheduleService } from '@/contexts/credit-policy/domain/services/legal-maximum-rate-schedule.service';
import { LegalMaximumRateTerms } from '@/contexts/credit-policy/domain/value-objects/legal-maximum-rate-terms.vo';
import type { PublishLegalMaximumRateCommand } from '@/contexts/credit-policy/application/commands/publish-legal-maximum-rate/publish-legal-maximum-rate.command';

export class PublishLegalMaximumRateHandler implements CommandHandler<PublishLegalMaximumRateCommand> {
  private readonly schedule = new LegalMaximumRateScheduleService();

  constructor(
    private readonly legalMaximumRateRepository: LegalMaximumRateRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: PublishLegalMaximumRateCommand): Promise<string> {
    const terms = LegalMaximumRateTerms.create(command.terms);
    const latest = await this.legalMaximumRateRepository.findLatestOf(terms.category);

    this.schedule.ensureNotBeforeLatest(terms, latest);

    const legalMaximumRate = LegalMaximumRate.create(this.ids.next(), terms, this.clock.now());

    await this.legalMaximumRateRepository.save(legalMaximumRate);

    return legalMaximumRate.id;
  }
}
