import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { IdentityDocumentKind } from '@/contexts/customer-due-diligence/domain/vocabularies/identity-document-kind.vocabulary';

export class IdentifyCustomerBody {
  /** The identity document the person shows: a passport, a national identity card or a residence permit. */
  @IsIn(Object.values(IdentityDocumentKind))
  documentKind: IdentityDocumentKind = IdentityDocumentKind.Passport;

  @IsString()
  @IsNotEmpty()
  documentNumber = '';

  /** The country that issued the identity document. */
  @IsString()
  @IsNotEmpty()
  issuingCountry = '';

  /** The day the identity document expires, as an ISO date. */
  @IsDateString()
  documentExpiresOn = '';

  /** The address of the person, as the proof of address states it. */
  @IsString()
  @IsNotEmpty()
  address = '';

  /** The day the proof of address is dated, as an ISO date. */
  @IsDateString()
  addressProofDatedOn = '';

  /** The name of the person, as the screening checks it against the lists. */
  @IsString()
  @IsNotEmpty()
  name = '';

  /** The birth date of the person, as an ISO date: the screening checks it with the name. */
  @IsDateString()
  birthDate = '';
}
