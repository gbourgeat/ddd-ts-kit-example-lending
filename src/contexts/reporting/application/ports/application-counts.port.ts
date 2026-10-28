import { ReadModelStore } from '@ddd-ts-kit/kernel';
import type { ApplicationCountRow } from '@/contexts/reporting/application/read-model/application-count.row';

/** The applications-per-branch read model: one line per tenant, branch and month, kept by the projection. */
export abstract class ApplicationCounts extends ReadModelStore<ApplicationCountRow> {}
