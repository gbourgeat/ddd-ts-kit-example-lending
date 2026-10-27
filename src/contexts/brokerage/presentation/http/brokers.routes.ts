import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/brokers', tags: ['brokerage'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class BrokersRoutes {}
