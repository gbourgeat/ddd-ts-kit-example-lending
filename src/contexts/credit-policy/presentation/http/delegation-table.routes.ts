import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/delegation-table', tags: ['credit-policy'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class DelegationTableRoutes {}
