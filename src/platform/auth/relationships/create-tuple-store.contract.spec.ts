import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { relationTupleStoreContract } from '@ddd-ts-kit/auth/testing';
import { createTupleStore } from '@/platform/auth/relationships/create-tuple-store';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

relationTupleStoreContract(
  { describe, it, expect, beforeEach },
  {
    name: 'The relation tuple store of the platform',
    create: async () => {
      await database.reset();

      return createTupleStore(database.persistence.database);
    },
  },
);
