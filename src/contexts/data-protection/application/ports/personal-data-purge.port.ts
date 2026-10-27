/**
 * The purge of the personal data past their retention, in every copy the contexts declared. Each
 * context keeps its own rule; the purge asks them all and answers how many rows it reached.
 */
export abstract class PersonalDataPurge {
  /** Purges the rows past their retention in each copy, and answers the number of rows purged. */
  abstract purgeExpired(): Promise<number>;
}
