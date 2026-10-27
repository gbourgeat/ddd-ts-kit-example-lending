export abstract class IntermediariesRegister {
  /** Asks the intermediaries register whether a registration number is valid on the given day. */
  abstract isValidOn(registrationNumber: string, day: Date): Promise<boolean>;
}
