import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/reports', tags: ['reporting'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class ReportsRoutes {}
