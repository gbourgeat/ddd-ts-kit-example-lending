import { IsString, IsNotEmpty } from 'class-validator';

export class AssignAdvisorBody {
  /** The advisor of the branch network who looks after the customer. */
  @IsString()
  @IsNotEmpty()
  advisorId = '';
}
