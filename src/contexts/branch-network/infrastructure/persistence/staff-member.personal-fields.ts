import { personalFields, type PersonalFieldsOptions } from '@ddd-ts-kit/kernel';
import type { PrismaPersonalTable } from '@ddd-ts-kit/prisma';

/** The table as the erasure reaches it, by the names `@@schema` and `@@map` give it: its statements are written on the table, not through the model. */
const TABLE: PrismaPersonalTable = { schema: 'branch_network', table: 'staff_members' };

/**
 * What `staff_members` keeps of a person in clear, and whose it is: the columns below belong to the person
 * `id` names, and each reads `[erased]` once that person is erased.
 * Read by PrismaBranchNetworkPersonalDataErasure, which `npm run privacy:erase` runs; a column added later that holds
 * personal data is declared here too, and its mapper writes it.
 */
// The columns are named as the database spells them (`@map`), since the erasure writes SQL on the table.
const declaration: PersonalFieldsOptions<Record<string, unknown>> = {
  subject: 'id',
  fields: ['name', 'email'],
  erasure: 'pseudonymise',
};

export const StaffMemberPersonalFields = personalFields(TABLE, declaration);
