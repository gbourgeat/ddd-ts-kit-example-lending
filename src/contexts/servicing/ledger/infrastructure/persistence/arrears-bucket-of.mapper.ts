import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

/** The arrears bucket a stored value names: a value the vocabulary does not know is a corrupt record, never read as a bucket. */
export function arrearsBucketOf(stored: string): ArrearsBucket {
  const bucket = Object.values(ArrearsBucket).find((value) => value === stored);

  if (bucket === undefined) {
    throw new Error(`Unknown arrears bucket "${stored}" in the stored loan.`);
  }

  return bucket;
}
