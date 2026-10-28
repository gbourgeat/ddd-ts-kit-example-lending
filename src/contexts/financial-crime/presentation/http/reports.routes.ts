import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({
  prefix: '/suspicious-activity-reports',
  tags: ['financial-crime'],
  guards: [Authenticated],
  errors: ['FORBIDDEN'],
})
export class ReportsRoutes {}
