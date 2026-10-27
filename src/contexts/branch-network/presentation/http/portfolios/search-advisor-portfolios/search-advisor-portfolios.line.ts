import { IsString } from 'class-validator';

/** A portfolio of the advisor: its identifier, the only thing the branch network knows of it here. */
export class SearchAdvisorPortfoliosLine {
  @IsString()
  id = '';
}
