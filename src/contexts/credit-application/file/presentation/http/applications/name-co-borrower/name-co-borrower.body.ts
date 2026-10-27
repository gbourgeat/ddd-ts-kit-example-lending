import { IsString } from 'class-validator';

/** The person named as co-borrower, by the identifier the bank gives them. */
export class NameCoBorrowerBody {
  @IsString()
  coBorrowerId = '';
}
