import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/businesses', tags: ['customer-due-diligence'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class BusinessesRoutes {}
