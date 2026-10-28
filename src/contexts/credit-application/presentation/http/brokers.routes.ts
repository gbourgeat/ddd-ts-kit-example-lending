import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/brokers', tags: ['credit-application'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class BrokersRoutes {}
