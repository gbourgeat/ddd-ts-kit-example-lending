export abstract class CustomerIdentityGateway {
  // Asks customer-due-diligence the name and birth date of a customer; undefined when the customer is not identified.
  abstract identityOf(customerId: string): Promise<{ name: string; birthDate: string } | undefined>;
}
