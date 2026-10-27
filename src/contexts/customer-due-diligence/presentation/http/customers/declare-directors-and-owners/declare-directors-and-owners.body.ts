import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { IdentifyCustomerBody } from '@/contexts/customer-due-diligence/presentation/http/customers/identify-customer/identify-customer.body';

export class DeclareDirectorsAndOwnersBody {
  /** The directors of the business, each one identified as a person. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdentifyCustomerBody)
  directors: IdentifyCustomerBody[] = [];

  /** The beneficial owners of the business, each one identified as a person. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdentifyCustomerBody)
  beneficialOwners: IdentifyCustomerBody[] = [];
}
