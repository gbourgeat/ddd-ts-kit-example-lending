import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({
  prefix: '/impact-assessments',
  tags: ['data-protection'],
  guards: [Authenticated],
  errors: ['FORBIDDEN'],
})
export class ImpactAssessmentsRoutes {}
