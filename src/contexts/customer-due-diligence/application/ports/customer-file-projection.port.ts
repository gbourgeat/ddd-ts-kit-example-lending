/** Writes the customer file read model: one row per identified customer, kept by the reaction to its identification. */
export abstract class CustomerFileProjection {
  abstract recordIdentified(customerId: string, identifiedOn: Date): Promise<void>;
}
