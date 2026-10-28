import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/rate-grids', tags: ['credit-application'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class RateGridsRoutes {}
