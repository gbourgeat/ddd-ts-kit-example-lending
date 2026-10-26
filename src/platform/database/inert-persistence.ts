import { createClient } from '@/platform/database/create-client';
import { persistenceOver } from '@/platform/database/persistence-over';
import type { Persistence } from '@/platform/database/persistence';

/** An address nothing listens on: the client connects on the first query, and none is ever sent. */
const NO_DATABASE = 'postgres://unused:unused@127.0.0.1:1/unused';

/** For what composes the application without serving it (the script that lists the routes, the architecture test of a platform wired by hand): no database has to be reachable. */
export function inertPersistence(): Persistence {
  return persistenceOver(createClient(NO_DATABASE));
}
