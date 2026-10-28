/** One party as the register was consulted for it: its name and birth date as customer-due-diligence answers them, and whether it is listed. */
export interface ConsultedParty {
  readonly customerId: string;
  readonly name: string;
  readonly birthDate: string;
  readonly listed: boolean;
}
