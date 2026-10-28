import { IsString } from 'class-validator';

/** The application may be read: the answer names no content of it. A refusal to read it is answered with the rules that refuse it. */
export class ExplainRefusalAnswer {
  @IsString()
  outcome = 'visible';
}
