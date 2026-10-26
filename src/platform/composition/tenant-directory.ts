import type { TenantDirectory } from '@ddd-ts-kit/kernel';
import type { Persistence } from '@/platform/database/persistence';
import { PrismaOrganisationTenantDirectory } from '@/contexts/identity/infrastructure/persistence/prisma-organisation-tenant-directory.reader';

/**
 * The tenants a job declared `per-tenant` runs for, asked again at each occurrence: the
 * organisations of the identity context, read from the database. An organisation opened
 * after the process started gets its run at the next occurrence, with no restart. `TENANTS` is
 * not read here: it is the list of a project with no source of tenants.
 */
export function tenantDirectory(persistence: Persistence, _fixed: readonly string[] = []): TenantDirectory {
  return new PrismaOrganisationTenantDirectory(persistence.database);
}
