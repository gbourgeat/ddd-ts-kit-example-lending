import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/scores', tags: ['credit-scoring'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class ScoresRoutes {}
