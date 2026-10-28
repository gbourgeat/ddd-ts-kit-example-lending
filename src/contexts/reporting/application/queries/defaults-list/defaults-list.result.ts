/** The defaults list, for the supervisor: each loan in default with its branch, the amount paid out to it and the instant of its default. */
export interface DefaultsListResult {
  /** One line per defaulted loan paid out on a known branch, sorted by loan. */
  readonly loans: readonly {
    readonly loanId: string;
    readonly branchId: string;
    readonly principalCents: number;
    /** The instant servicing declared the default, as an ISO 8601 instant. */
    readonly defaultedAt: string;
  }[];
}
