import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({
  prefix: '/due-diligence',
  tags: ['customer-due-diligence'],
  guards: [Authenticated],
  errors: ['FORBIDDEN'],
})
export class DueDiligenceRoutes {}
