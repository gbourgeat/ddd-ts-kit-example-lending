import { PrismaPersonalDataErasure } from '@ddd-ts-kit/prisma';
import type { RetentionPeriod } from '@ddd-ts-kit/kernel';
import type { IdentityPersonalDataErasure } from '@/contexts/identity/application/ports/identity-personal-data-erasure.port';
import type { Prisma } from '$generated/prisma/client';
import type { Database } from '@/platform/database/database';
// ddd-ts-kit:imports
import { AccountPersonalFields } from '@/contexts/identity/infrastructure/persistence/account.personal-fields';
import { InvitationPersonalFields } from '@/contexts/identity/infrastructure/persistence/invitation.personal-fields';
// /ddd-ts-kit:imports

/**
 * What identity keeps of a person in clear, erased from every table declared below as its
 * declaration says: the rows of the person deleted, or their personal columns pseudonymised, the files
 * they name deleted first. Run by `npm run privacy:erase` with the copies of the other contexts, never
 * by a use case.
 */
export class PrismaIdentityPersonalDataErasure
  extends PrismaPersonalDataErasure<Prisma.TransactionClient>
  implements IdentityPersonalDataErasure
{
  constructor(database: Database, invitations: RetentionPeriod) {
    super(database, {
      name: 'identity',
      declarations: [
        // ddd-ts-kit:personal-fields
        AccountPersonalFields,
        { ...InvitationPersonalFields, retention: { after: 'expires_at', ...invitations } },
        // /ddd-ts-kit:personal-fields
      ],
    });
  }
}
