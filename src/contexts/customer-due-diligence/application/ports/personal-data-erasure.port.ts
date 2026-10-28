/** The erasure of the personal values a customer is known by: the key they are sealed with is destroyed, so the stored events read them as erased. */
export abstract class PersonalDataErasure {
  /** Erases the personal values of the customer; erasing a customer already erased changes nothing. */
  abstract erase(customerId: string): Promise<void>;
}
