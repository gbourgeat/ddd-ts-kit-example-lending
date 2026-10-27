import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/products', tags: ['credit-policy'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class ProductsRoutes {}
