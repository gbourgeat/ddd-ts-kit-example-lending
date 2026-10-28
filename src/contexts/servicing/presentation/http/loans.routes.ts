import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/loans', tags: ['servicing'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class LoansRoutes {}
