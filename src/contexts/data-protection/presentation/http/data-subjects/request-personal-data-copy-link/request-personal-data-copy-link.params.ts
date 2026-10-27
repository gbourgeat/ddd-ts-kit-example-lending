import { IsString } from 'class-validator';

export class RequestPersonalDataCopyLinkParams {
  @IsString()
  customerId = '';

  @IsString()
  copyId = '';
}
