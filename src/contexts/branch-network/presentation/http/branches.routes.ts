import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/branches', tags: ['branch-network'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class BranchesRoutes {}
