import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaPersonalDataErasure } from '@ddd-ts-kit/prisma';
import type { BranchNetworkPersonalDataErasure } from '@/contexts/branch-network/application/ports/branch-network-personal-data-erasure.port';
import type { Prisma } from '$generated/prisma/client';
import type { Database } from '@/platform/database/database';
// ddd-ts-kit:imports
import { StaffMemberPersonalFields } from '@/contexts/branch-network/infrastructure/persistence/staff-member.personal-fields';
// /ddd-ts-kit:imports

/**
 * What branch-network keeps of a person in clear, erased from every table declared below as its
 * declaration says: the rows of the person deleted, or their personal columns pseudonymised, the files
 * they name deleted first. Run by `npm run privacy:erase` with the copies of the other contexts, never
 * by a use case; every statement is confined to the tenant of the work.
 */
export class PrismaBranchNetworkPersonalDataErasure
  extends PrismaPersonalDataErasure<Prisma.TransactionClient>
  implements BranchNetworkPersonalDataErasure
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      name: 'branch-network',
      declarations: [
        // ddd-ts-kit:personal-fields
        StaffMemberPersonalFields,
        // /ddd-ts-kit:personal-fields
      ],
      tenant: { scope },
    });
  }
}
