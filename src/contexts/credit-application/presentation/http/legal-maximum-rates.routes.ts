import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({
  prefix: '/legal-maximum-rates',
  tags: ['credit-application'],
  guards: [Authenticated],
  errors: ['FORBIDDEN'],
})
export class LegalMaximumRatesRoutes {}
