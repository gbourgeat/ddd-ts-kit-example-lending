import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

/**
 * The global setup of the test runs (`globalSetup` of jest.config.js, which jest.e2e.config.js
 * extends): starts PostgreSQL in process once and saves its initialised cluster to a file. Each spec
 * of the run opens a copy of it (open-test-database.ts) instead of running an initdb of its own, the
 * slow part of starting, then creates its tables there, so that what creates them stays run and
 * measured in every spec. The workers Jest starts next inherit the variable that names the file;
 * test-database-teardown.ts deletes it.
 */
export default async function setup(): Promise<void> {
  const directory = await mkdtemp(path.join(tmpdir(), 'test-database-'));
  const file = path.join(directory, 'cluster.tar');
  const engine = await PGlite.create();

  await writeFile(file, new Uint8Array(await (await engine.dumpDataDir('none')).arrayBuffer()));
  await engine.close();
  process.env['TEST_DATABASE_TEMPLATE'] = file;
}
