import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import type { GetLoanStatementReader } from '@/contexts/servicing/ledger/application/ports/get-loan-statement-reader.port';
import { GetLoanStatementHandler } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.handler';
import { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import type { GetLoanStatementResult } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.result';

const LOAN_ID = 'loan-1';
const AS_OF = new Date('2026-03-15T00:00:00.000Z');

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.read']] },
  }),
  map: AuthorizationMap.of(requires(GetLoanStatementQuery, servicingPermissions['loan.read'])),
});

const holder = anActor().withRole('holder').build();

const STATEMENT: GetLoanStatementResult = {
  loanId: LOAN_ID,
  asOf: AS_OF.toISOString(),
  outstandingCapitalCents: 95_000,
  arrearsCents: 8_000,
  daysPastDue: 33,
  instalmentsCents: [8_000, 8_000],
  instalmentsDue: [1, 2],
  instalmentsPaid: [],
  instalmentsUnpaid: [1],
};

describe('Get loan statement', () => {
  it('answers the statement the reader replayed for the loan on the date', async () => {
    const queryBus = arrange(STATEMENT);

    expect(await queryBus.execute(new GetLoanStatementQuery(holder, LOAN_ID, AS_OF))).toEqual(STATEMENT);
  });

  it('hands the reader the loan and the date the query names', async () => {
    const reader = new RecordingReader(STATEMENT);
    const queryBus = arrangeWith(reader);

    await queryBus.execute(new GetLoanStatementQuery(holder, LOAN_ID, AS_OF));

    expect(reader.received).toEqual({ loanId: LOAN_ID, asOf: AS_OF });
  });

  it('is refused to an actor who does not hold the permission loan.read', async () => {
    const queryBus = arrange(STATEMENT);
    const query = new GetLoanStatementQuery(anActor().build(), LOAN_ID, AS_OF);

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** A reader that answers the statement it is given, and keeps the query it was asked: a working double of the port. */
class RecordingReader implements GetLoanStatementReader {
  received: { loanId: string; asOf: Date } | undefined;

  constructor(private readonly answer: GetLoanStatementResult) {}

  async read(query: GetLoanStatementQuery): Promise<GetLoanStatementResult> {
    this.received = { loanId: query.loanId, asOf: query.asOf };

    return this.answer;
  }
}

function arrange(answer: GetLoanStatementResult) {
  return arrangeWith(new RecordingReader(answer));
}

function arrangeWith(reader: GetLoanStatementReader) {
  const { queryBus } = createTestBuses();
  const handler = new GetLoanStatementHandler(reader);

  return queryBus.use(holders).register(GetLoanStatementQuery, handler);
}
