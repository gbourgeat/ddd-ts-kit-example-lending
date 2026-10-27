import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({
  prefix: '/customer-files',
  tags: ['customer-due-diligence'],
  guards: [Authenticated],
  errors: ['FORBIDDEN'],
})
export class CustomerFilesRoutes {}
