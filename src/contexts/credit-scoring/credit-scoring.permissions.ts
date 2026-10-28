import { definePermissions } from '@ddd-ts-kit/auth';

export const creditScoringPermissions = definePermissions('credit-scoring', {
  // ddd-ts-kit:permissions
  'scoring-model.publish': { description: 'Publish scoring model version' },
  'score.compute': { description: 'Score applicant' },
  // /ddd-ts-kit:permissions
});
