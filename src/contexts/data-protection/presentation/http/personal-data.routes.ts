import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({ prefix: '/personal-data', tags: ['data-protection'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class PersonalDataRoutes {}
