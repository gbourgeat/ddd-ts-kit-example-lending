import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/deciders', tags: ['credit-application'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class DecidersRoutes {}
