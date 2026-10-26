import { beforeEach, describe, expect, it } from '@jest/globals';
import { relationTupleStoreContract } from '@ddd-ts-kit/auth/testing';
import { createTupleStore } from '@/platform/auth/relationships/create-tuple-store';

relationTupleStoreContract(
  { describe, it, expect, beforeEach },
  { name: 'The relation tuple store of the platform', create: createTupleStore },
);
