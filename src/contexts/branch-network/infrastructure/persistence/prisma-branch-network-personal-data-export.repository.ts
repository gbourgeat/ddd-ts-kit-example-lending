import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import { PrismaPersonalDataExport } from '@ddd-ts-kit/prisma';
import type { BranchNetworkPersonalDataExport } from '@/contexts/branch-network/application/ports/branch-network-personal-data-export.port';
import type { Prisma } from '$generated/prisma/client';
import type { Database } from '@/platform/database/database';
// ddd-ts-kit:imports
import { StaffMemberPersonalFields } from '@/contexts/branch-network/infrastructure/persistence/staff-member.personal-fields';
// /ddd-ts-kit:imports

/**
 * What branch-network keeps of a person in clear, handed over from every table declared below as
 * plain data: one record per row about the person, under `branch-network.<table>`, the personal columns
 * alone. Run by `npm run privacy:export` with the exports of the other contexts, never by a use
 * case; every statement is confined to the tenant of the work.
 */
export class PrismaBranchNetworkPersonalDataExport
  extends PrismaPersonalDataExport<Prisma.TransactionClient>
  implements BranchNetworkPersonalDataExport
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
