import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/portfolios', tags: ['branch-network'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class PortfoliosRoutes {}
