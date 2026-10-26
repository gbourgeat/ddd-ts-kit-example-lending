import type { PersonalDataExport } from '@ddd-ts-kit/kernel';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaIdentityPersonalDataExport } from '@/contexts/identity/infrastructure/persistence/prisma-identity-personal-data-export.repository';
// /ddd-ts-kit:imports

/**
 * The exports of what the contexts keep of a person, each the adapter of its context, instantiated
 * from the platform as the module file of the context does. A context that
 * exports what it keeps of a person adds the adapter here.
 */
export const dataSubjectExports: readonly ((platform: Platform) => PersonalDataExport)[] = [
  // ddd-ts-kit:exports
  (platform) =>
    platform.adapter(new PrismaIdentityPersonalDataExport(platform.persistence.database), {
      kind: 'repository',
      context: 'identity',
      token: 'IdentityPersonalDataExport',
    }),
  // /ddd-ts-kit:exports
];
