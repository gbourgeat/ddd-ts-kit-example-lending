import { Authenticated, RouteGroup } from '@ddd-ts-kit/http';

@RouteGroup({
  prefix: '/residual-income-minimums',
  tags: ['credit-policy'],
  guards: [Authenticated],
  errors: ['FORBIDDEN'],
})
export class ResidualIncomeMinimumsRoutes {}
