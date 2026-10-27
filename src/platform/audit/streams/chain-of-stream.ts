import { chainOfTenant } from '@ddd-ts-kit/audit';
import type { AuditRecord } from '@ddd-ts-kit/kernel';
import { financialCrimeStream } from '@/platform/audit/streams/financial-crime-stream';

/** The chain an entry is appended to: the stream of financial crime has one of its own, every other entry its tenant's chain. */
export function chainOfStream(record: AuditRecord): string {
  const chain = chainOfTenant(record);

  return record.context === financialCrimeStream.context ? `stream:${financialCrimeStream.context}:${chain}` : chain;
}
