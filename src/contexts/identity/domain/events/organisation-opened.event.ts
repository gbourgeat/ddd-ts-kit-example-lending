import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

/** An organisation was opened, its opener its first owner. */
export class OrganisationOpened extends NamedDomainEvent('identity.organisation.opened') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly facts: {
      readonly name: string;
      readonly openedBy: string;
    },
  ) {
    super();
  }
}
