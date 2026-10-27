export abstract class RepaymentIncidentRegister {
  /** Declares a loan to the national register of repayment incidents, after two unpaid instalments. */
  abstract declare(loanReference: string): Promise<void>;

  /** Withdraws the declaration once the arrears are paid. */
  abstract withdraw(loanReference: string): Promise<void>;
}
