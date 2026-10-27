import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/customers', tags: ['customer-due-diligence'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class CustomersRoutes {}
