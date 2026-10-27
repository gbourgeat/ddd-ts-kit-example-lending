import { IsString } from 'class-validator';

export class GetCustomerFileLine {
  @IsString()
  id = '';

  // TODO(domain): declare the fields of GetCustomerFileItem that are part of the public contract, each with its class-validator decorators.
}
