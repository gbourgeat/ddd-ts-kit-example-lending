export abstract class RepaymentIncidentRegister {
  /** Asks the national register of repayment incidents whether a person is listed there. */
  abstract isListed(name: string, birthDate: Date): Promise<boolean>;
}
