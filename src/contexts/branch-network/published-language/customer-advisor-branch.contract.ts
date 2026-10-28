export abstract class CustomerAdvisorBranchContract {
  // Answers the branch of the advisor whose portfolio holds the customer; undefined when no advisor holds it.
  abstract branchOfCustomerAdvisor(customerId: string): Promise<string | undefined>;
}
