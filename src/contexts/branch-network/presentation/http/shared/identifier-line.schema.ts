import { IsString } from 'class-validator';

/** A line of a page of identifiers: the only thing the branch network knows of the listed item here. */
export class IdentifierLine {
  @IsString()
  id = '';
}
