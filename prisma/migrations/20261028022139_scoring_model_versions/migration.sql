-- AlterTable
ALTER TABLE "credit_scoring"."scoring_models" ADD COLUMN     "versions" JSONB NOT NULL DEFAULT '[]';
