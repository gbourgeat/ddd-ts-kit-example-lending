import { IsString } from 'class-validator';

export class SearchPortfolioCustomersParams {
  @IsString()
  id = '';
}
