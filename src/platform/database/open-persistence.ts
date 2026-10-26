import { createClient } from '@/platform/database/create-client';
import { persistenceOver } from '@/platform/database/persistence-over';
import type { Persistence } from '@/platform/database/persistence';

export async function openPersistence(config: { readonly databaseUrl: string }): Promise<Persistence> {
  const client = createClient(config.databaseUrl);

  await client.$connect();

  return persistenceOver(client);
}
