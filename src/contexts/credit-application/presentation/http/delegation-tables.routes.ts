import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({
  prefix: '/delegation-tables',
  tags: ['credit-application'],
  guards: [Authenticated],
  errors: ['FORBIDDEN'],
})
export class DelegationTablesRoutes {}
