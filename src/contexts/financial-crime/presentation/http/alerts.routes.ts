import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/alerts', tags: ['financial-crime'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class AlertsRoutes {}
