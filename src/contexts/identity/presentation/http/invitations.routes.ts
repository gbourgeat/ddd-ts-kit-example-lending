import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

/** The answers of a person to an invitation sent to them, by its token. */
@RouteGroup({ prefix: '/invitations', tags: ['identity'], guards: [Authenticated], errors: ['FORBIDDEN'] })
export class InvitationsRoutes {}
