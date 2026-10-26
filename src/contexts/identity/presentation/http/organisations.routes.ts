import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

/** The organisations, their members, their invitations and their delegations: inside one, the policies of the context decide. */
@RouteGroup({ prefix: '/organisations', tags: ['identity'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class OrganisationsRoutes {}
