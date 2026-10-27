import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/conflicts', tags: ['branch-network'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class ConflictsRoutes {}
