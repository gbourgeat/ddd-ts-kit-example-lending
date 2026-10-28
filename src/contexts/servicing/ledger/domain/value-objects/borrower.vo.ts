import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidBorrower } from '@/contexts/servicing/ledger/domain/errors/invalid-borrower.error';

export type BorrowerProps = {
  readonly name: string;
  readonly postalAddress: string;
};

/** The person who owes the loan, as the statements of the loan show them. */
export class Borrower extends ValueObject<BorrowerProps> {
  private constructor(props: BorrowerProps) {
    super(props);
  }

  static create(name: string, postalAddress: string): Borrower {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      throw InvalidBorrower.forName();
    }

    return new Borrower({ name: trimmedName, postalAddress: postalAddress.trim() });
  }

  get name(): string {
    return this.props.name;
  }

  get postalAddress(): string {
    return this.props.postalAddress;
  }
}
