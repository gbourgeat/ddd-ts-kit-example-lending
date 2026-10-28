import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { DefaultedLoansReader } from '@/contexts/reporting/application/ports/defaulted-loans-reader.port';
import type { DefaultedLoansQuery } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.query';
import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';

export class DefaultedLoansHandler implements QueryHandler<DefaultedLoansQuery> {
  constructor(private readonly reader: DefaultedLoansReader) {}

  async execute(_query: DefaultedLoansQuery): Promise<DefaultedLoansResult> {
    return this.reader.read();
  }
}
