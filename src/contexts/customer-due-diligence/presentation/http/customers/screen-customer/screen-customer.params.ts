import { IsString } from 'class-validator';

export class ScreenCustomerParams {
  @IsString()
  id = '';
}
