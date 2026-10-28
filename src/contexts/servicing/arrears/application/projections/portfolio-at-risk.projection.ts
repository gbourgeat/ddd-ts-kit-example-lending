import { type DomainEvent, type ReadModelWrite, storedStampOf, stampOf } from '@ddd-ts-kit/kernel';
import { On, Projection } from '@ddd-ts-kit/kernel/declarations';
import type { PortfolioAtRisk } from '@/contexts/servicing/arrears/application/ports/portfolio-at-risk.port';
import type { PortfolioAtRiskRow } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.row';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanScheduled } from '@/contexts/servicing/ledger/domain/events/loan-scheduled.event';

/** Keeps the principal and the arrears bucket of each loan, applied from the event store of the loans, from position zero. */
@Projection('servicing.portfolio-at-risk', { feed: 'event-store' })
export class PortfolioAtRiskProjection {
  constructor(private readonly portfolio: PortfolioAtRisk) {}

  /** The loan is paid out: its principal is the one of its schedule, and it is in no arrears bucket yet. */
  @On(LoanScheduled)
  scheduled(event: LoanScheduled): Promise<ReadModelWrite> {
    return this.portfolio.upsertIfNewer(event.aggregateId, this.stampOf(event), () => ({
      loanId: event.aggregateId,
      principalCents: event.schedule.principal.cents,
      bucket: ArrearsBucket.None,
      open: true,
    }));
  }

  /** The loan was placed in an arrears bucket, `None` included: its previous bucket is replaced. */
  @On(LoanArrearsBucketEntered)
  bucketEntered(event: LoanArrearsBucketEntered): Promise<ReadModelWrite> {
    return this.update(event, (row) => ({ ...row, bucket: event.bucket }));
  }

  /** The loan is closed: it leaves the portfolio, and its row keeps its figures. */
  @On(LoanClosed)
  closed(event: LoanClosed): Promise<ReadModelWrite> {
    return this.update(event, (row) => ({ ...row, open: false }));
  }

  /** Changes the row of the loan of the event, unless it has none: an event of a loan never scheduled writes nothing. */
  private update(
    event: LoanArrearsBucketEntered | LoanClosed,
    change: (row: PortfolioAtRiskRow) => PortfolioAtRiskRow,
  ): Promise<ReadModelWrite> {
    return this.portfolio.upsertIfNewer(event.aggregateId, this.stampOf(event), (current) =>
      current === undefined ? undefined : change(current),
    );
  }

  /** The stamp of the stored event, which orders the rows of one stream by the stream itself. */
  private stampOf(event: DomainEvent) {
    return storedStampOf(event) ?? stampOf(event);
  }
}
