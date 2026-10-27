import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/rate-grids', tags: ['credit-policy'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class RateGridsRoutes {}
