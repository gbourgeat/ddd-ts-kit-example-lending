import { IsString } from 'class-validator';

export class ReadProductTermsParams {
  @IsString()
  productId = '';
}
