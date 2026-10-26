import { PrismaPersonalDataExport } from '@ddd-ts-kit/prisma';
import type { IdentityPersonalDataExport } from '@/contexts/identity/application/ports/identity-personal-data-export.port';
import type { Prisma } from '$generated/prisma/client';
import type { Database } from '@/platform/database/database';
// ddd-ts-kit:imports
import { AccountPersonalFields } from '@/contexts/identity/infrastructure/persistence/account.personal-fields';
import { InvitationPersonalFields } from '@/contexts/identity/infrastructure/persistence/invitation.personal-fields';
// /ddd-ts-kit:imports

/**
 * What identity keeps of a person in clear, handed over from every table declared below as
 * plain data: one record per row about the person, under `identity.<table>`, the personal columns
 * alone. Run by `npm run privacy:export` with the exports of the other contexts, never by a use
 * case.
 */
export class PrismaIdentityPersonalDataExport
  extends PrismaPersonalDataExport<Prisma.TransactionClient>
  implements IdentityPersonalDataExport
{
  constructor(database: Database) {
    super(database, {
      name: 'identity',
      declarations: [
        // ddd-ts-kit:personal-fields
        AccountPersonalFields,
        InvitationPersonalFields,
        // /ddd-ts-kit:personal-fields
      ],
    });
  }
}
