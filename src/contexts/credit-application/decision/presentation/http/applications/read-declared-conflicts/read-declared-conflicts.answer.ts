import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { DeclaredConflictLine } from '@/contexts/credit-application/decision/presentation/http/applications/read-declared-conflicts/declared-conflict.line';

export class ReadDeclaredConflictsAnswer {
  /** The conflicts declared on the applicant of the application, in the order they were declared. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeclaredConflictLine)
  conflicts: DeclaredConflictLine[] = [];
}
