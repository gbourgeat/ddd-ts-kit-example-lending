import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/offers', tags: ['credit-application'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class OffersRoutes {}
