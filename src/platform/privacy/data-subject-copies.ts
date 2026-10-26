import type { PersonalDataCopy } from '@ddd-ts-kit/kernel';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaIdentityPersonalDataErasure } from '@/contexts/identity/infrastructure/persistence/prisma-identity-personal-data-erasure.repository';
// /ddd-ts-kit:imports

/**
 * The copies the contexts keep of a person, each erased by the adapter of its context, instantiated
 * from the platform as the module file of the context does. `generate repository <context> <Aggregate>
 * --personal <column>,...` adds the adapter of its context here, once.
 */
export const dataSubjectCopies: readonly ((platform: Platform) => PersonalDataCopy)[] = [
  // ddd-ts-kit:copies
  (platform) =>
    platform.adapter(new PrismaIdentityPersonalDataErasure(platform.persistence.database), {
      kind: 'repository',
      context: 'identity',
      token: 'IdentityPersonalDataErasure',
    }),
  // /ddd-ts-kit:copies
];
