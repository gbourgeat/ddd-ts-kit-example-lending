import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/data-subjects', tags: ['data-protection'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class DataSubjectsRoutes {}
