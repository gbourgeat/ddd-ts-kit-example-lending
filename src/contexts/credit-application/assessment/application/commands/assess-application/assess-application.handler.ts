import type { Clock, CommandHandler, FileStorage } from '@ddd-ts-kit/kernel';
import type { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import type { ScoringGateway } from '@/contexts/credit-application/assessment/application/ports/scoring-gateway.port';
import type { IncomeAndExpenses } from '@/contexts/credit-application/assessment/application/ports/account-information-provider.port';
import type {
  ApplicationAssessment,
  AssessApplicationCommand,
} from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.command';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import { MissingAccountInformation } from '@/contexts/credit-application/assessment/domain/errors/missing-account-information.error';
import { RegisterNotConsulted } from '@/contexts/credit-application/assessment/domain/errors/register-not-consulted.error';
import { NoScoreAvailable } from '@/contexts/credit-application/assessment/domain/errors/no-score-available.error';
import { DebtToIncomeRatioService } from '@/contexts/credit-application/assessment/domain/services/debt-to-income-ratio.service';
import { ResidualIncomeService } from '@/contexts/credit-application/assessment/domain/services/residual-income.service';
import { AssessmentProposalService } from '@/contexts/credit-application/assessment/domain/services/assessment-proposal.service';
import { Money } from '@/shared-kernel/money.vo';

const PERCENT = 100;
/** The account information is kept as a document of the file under this segment of its key, by the read of the accounts. */
const ACCOUNTS_KEY_SEGMENT = '/accounts/';
/** The repayments are the monthly expenses read from the accounts: no fixed charge is read yet. */
const NO_FIXED_CHARGES_CENTS = 0;

type AssessmentRecord = CreditApplicationAssessed['assessment'];

export class AssessApplicationHandler implements CommandHandler<AssessApplicationCommand> {
  private readonly debtToIncome = new DebtToIncomeRatioService();
  private readonly residualIncome = new ResidualIncomeService();
  private readonly proposal = new AssessmentProposalService();

  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly storage: FileStorage,
    private readonly scoring: ScoringGateway,
    private readonly clock: Clock,
  ) {}

  async execute(command: AssessApplicationCommand): Promise<ApplicationAssessment> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const assessment = await this.assessmentOf(creditApplication);

    creditApplication.assess(assessment, this.clock.now());

    await this.creditApplicationRepository.save(creditApplication);

    return { applicationId: creditApplication.id, assessment };
  }

  /** Assembles what the assessment rests on: the ratios from the accounts, the register answer, then the score of the scoring model. */
  private async assessmentOf(creditApplication: CreditApplication): Promise<AssessmentRecord> {
    const figures = await this.accountFiguresOf(creditApplication);
    const netIncome = Money.ofCents(figures.monthlyIncomeInCents);
    const repayments = Money.ofCents(figures.monthlyExpensesInCents);
    const residualIncome = this.residualIncome.of(netIncome, repayments, Money.ofCents(NO_FIXED_CHARGES_CENTS));
    const debtToIncomePercent = Math.round(this.debtToIncome.ratioOf(repayments, netIncome) * PERCENT);
    const repaymentIncidents = this.listedPartyCountOf(creditApplication);

    const scoring = await this.scoring.scoreOf({
      debtToIncomePercent,
      repaymentIncidents,
      residualIncomeCents: residualIncome.cents,
    });

    if (scoring === undefined) {
      throw NoScoreAvailable.forScore(creditApplication.id);
    }

    return {
      modelVersion: scoring.modelVersion,
      debtToIncomePercent,
      repaymentIncidents,
      residualIncomeCents: residualIncome.cents,
      score: scoring.score,
      band: scoring.band,
      factors: scoring.factors,
      proposedOutcome: this.proposal.outcomeOf(scoring.band, residualIncome),
    };
  }

  private listedPartyCountOf(creditApplication: CreditApplication): number {
    const listedPartyCount = creditApplication.listedPartyCount;

    if (listedPartyCount === undefined) {
      throw RegisterNotConsulted.forApplication(creditApplication.id);
    }

    return listedPartyCount;
  }

  /** The income and expenses of the latest reading of the accounts, read back from the object store. */
  private async accountFiguresOf(creditApplication: CreditApplication): Promise<IncomeAndExpenses> {
    const key = creditApplication.documentKeys
      .filter((documentKey) => documentKey.includes(ACCOUNTS_KEY_SEGMENT))
      .at(-1);

    const file = key === undefined ? undefined : await this.storage.get(key);

    if (file === undefined) {
      throw MissingAccountInformation.forApplication(creditApplication.id);
    }

    const chunks: Uint8Array[] = [];

    for await (const chunk of file.stream) {
      if (chunk instanceof Uint8Array) {
        chunks.push(chunk);
      }
    }

    return this.figuresOf(JSON.parse(Buffer.concat(chunks).toString('utf8')), creditApplication);
  }

  /** The stored figures are checked before the assessment uses them: a document of another shape is not account information. */
  private figuresOf(stored: unknown, creditApplication: CreditApplication): IncomeAndExpenses {
    if (!isIncomeAndExpenses(stored)) {
      throw MissingAccountInformation.forApplication(creditApplication.id);
    }

    return stored;
  }
}

function isIncomeAndExpenses(value: unknown): value is IncomeAndExpenses {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'monthlyIncomeInCents' in value &&
    typeof value.monthlyIncomeInCents === 'number' &&
    'monthlyExpensesInCents' in value &&
    typeof value.monthlyExpensesInCents === 'number'
  );
}
