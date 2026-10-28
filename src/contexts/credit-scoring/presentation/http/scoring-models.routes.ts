import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/scoring-models', tags: ['credit-scoring'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class ScoringModelsRoutes {}
