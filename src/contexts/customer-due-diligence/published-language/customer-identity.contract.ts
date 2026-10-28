export abstract class CustomerIdentityContract {
  // Answers the name and birth date of an identified customer; undefined when the customer is not identified.
  abstract identityOf(customerId: string): Promise<{ name: string; birthDate: string } | undefined>;
}
