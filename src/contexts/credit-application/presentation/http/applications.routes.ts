import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/applications', tags: ['credit-application'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class ApplicationsRoutes {}
