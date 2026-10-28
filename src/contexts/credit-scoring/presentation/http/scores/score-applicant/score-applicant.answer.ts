import { IsIn, IsInt, IsObject, IsString } from 'class-validator';
import { Band } from '@/contexts/credit-scoring/domain/vocabularies/band.vocabulary';

/** The score of an applicant, its band, the model version that gave it, the inputs and the factors that lowered it. */
export class ScoreApplicantAnswer {
  /** The score, a whole number from 0 to 100. */
  @IsInt()
  score = 0;

  /** The band of the score: the green band is the only one an advisor decides with. */
  @IsIn(Object.values(Band))
  band: Band = Band.Red;

  /** The label of the model version that scored the applicant. */
  @IsString()
  modelVersion = '';

  /** The inputs the score was computed from. */
  @IsObject()
  inputs: {
    debtToIncomePercent: number;
    repaymentIncidents: number;
    residualIncomeCents: number;
  } = { debtToIncomePercent: 0, repaymentIncidents: 0, residualIncomeCents: 0 };

  /** The main factors that lowered the score, in words a customer understands, the most harmful first. */
  @IsString({ each: true })
  factors: string[] = [];
}
