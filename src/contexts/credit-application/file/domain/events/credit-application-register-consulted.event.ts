import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** The repayment incident register was consulted for the parties of the application, and what it answered for each: listed or not, never a name nor a birth date. */
export class CreditApplicationRegisterConsulted extends NamedDomainEvent(
  'credit-application.credit-application.register-consulted',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly parties: readonly { readonly customerId: string; readonly listed: boolean }[],
  ) {
    super();
  }
}
