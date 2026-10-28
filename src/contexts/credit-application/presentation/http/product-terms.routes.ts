import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/product-terms', tags: ['credit-application'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class ProductTermsRoutes {}
