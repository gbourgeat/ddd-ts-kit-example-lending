import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import type { RelationTuple } from '@ddd-ts-kit/auth/rebac';
import { createTupleStore } from '@/platform/auth/relationships/create-tuple-store';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';

// A relationship is part of the change it describes: a unit of work that rolls back takes its tuples with it.

const adaEdits: RelationTuple = { object: 'document:1', relation: 'editor', subject: 'user:ada' };

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

beforeEach(async () => {
  await database.reset();
});

describe('The relation tuple store, in the unit of work of the change', () => {
  it('keeps a tuple written in a unit of work that rolled back out of the store', async () => {
    const store = createTupleStore(database.persistence.database);

    await expect(
      database.persistence.unitOfWork.run(async () => {
        await store.write([adaEdits]);

        throw new Error('the change failed');
      }),
    ).rejects.toThrow('the change failed');

    expect(await store.readByObject('document:1', 'editor')).toEqual([]);
  });

  it('keeps a tuple written in a unit of work that committed', async () => {
    const store = createTupleStore(database.persistence.database);

    await database.persistence.unitOfWork.run(async () => {
      await store.write([adaEdits]);
    });

    expect(await store.readByObject('document:1', 'editor')).toEqual([adaEdits]);
  });
});
