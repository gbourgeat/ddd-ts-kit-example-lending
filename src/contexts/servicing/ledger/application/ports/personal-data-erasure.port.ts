/** The erasure of the personal values a loan is known by: the key they are sealed with is destroyed, so the stored events read them as erased. */
export abstract class PersonalDataErasure {
  /** Erases the personal values of the loan; erasing a loan already erased changes nothing. */
  abstract erase(loanId: string): Promise<void>;
}
