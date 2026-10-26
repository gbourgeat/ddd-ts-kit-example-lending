import { Module, type DynamicModule } from '@nestjs/common';
import type { Route } from '@ddd-ts-kit/http';
import { createRoutesModule, type NestControllers, provideControllers } from '@ddd-ts-kit/http/nest';
import type { HttpBoundary } from '@/platform/auth/authentication/http-boundary';

@Module({})
class AppModule {}

/**
 * The Nest application: the routes mounted on its HTTP server by the `RoutesMounter` of their
 * module, and the Nest controllers of the contexts built by its container with what they inject.
 */
export function createAppModule(
  routes: readonly Route[],
  boundary: HttpBoundary,
  controllers: NestControllers,
): DynamicModule {
  return { module: AppModule, imports: [createRoutesModule(routes, boundary), provideControllers(controllers)] };
}
