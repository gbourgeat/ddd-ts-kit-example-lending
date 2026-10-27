import { IsString } from 'class-validator';

/** A customer of the portfolio: its identifier, the only thing the branch network knows of it. */
export class SearchPortfolioCustomersLine {
  @IsString()
  id = '';
}
