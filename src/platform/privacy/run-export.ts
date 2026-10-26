import { auditedPersonalDataExport } from '@ddd-ts-kit/audit';
import {
  executionContext,
  exportDataSubject,
  recordsInEachTenant,
  type Actor,
  type PersonalDataExport,
  type PersonalDataExportDocument,
} from '@ddd-ts-kit/kernel';
import type { Platform } from '@/platform/composition/platform';
import { dataSubjectExports } from '@/platform/privacy/data-subject-exports';

export interface ExportRequest {
  /** The assembled platform: the scope, the clock, the trail and the exports come from it. */
  readonly platform: Platform;
  /** Who asks for the export, as typed: the actor of the work, named by the entry each export writes. */
  readonly operator: string;
  /** The correlation of the work: one per export. */
  readonly correlationId: string;
  /** The tenants the deployment serves: the records are gathered in each one, in an execution context of that tenant, since a read of tenant data is confined to it. */
  readonly tenants: readonly string[];
}

/**
 * The right of access and to portability of one data subject (GDPR articles 15 and 20), in an
 * execution context of its own (origin `cli`): every record each context declared in
 * `data-subject-exports.ts` keeps of the person, in every tenant, gathered into one dated document
 * of a stable format; every export writes its entry to the audit trail, the operator, the subject and
 * the number of records, never the values. A subject that is not an opaque identifier is refused
 * before anything is read.
 */
export function runExport(subject: string, request: ExportRequest): Promise<PersonalDataExportDocument> {
  const { platform, operator, correlationId } = request;
  const context = executionContext({ correlationId, actor: operatorActor(operator), origin: 'cli' });
  const { trail } = platform.audit;
  const source = { scope: platform.scope, clock: platform.clock, ids: platform.ids };
  const audited = (port: PersonalDataExport): PersonalDataExport => auditedPersonalDataExport(port, trail, source);
  const exports = dataSubjectExports.map((exported) => audited(exported(platform)));

  return platform.scope.run(context, () =>
    exportDataSubject(subject, {
      exports,
      clock: platform.clock,
      inEveryTenant: recordsInEachTenant(platform.scope, request.tenants),
    }),
  );
}

function operatorActor(id: string): Actor {
  return { id, type: 'user', roles: [], attributes: {} };
}
