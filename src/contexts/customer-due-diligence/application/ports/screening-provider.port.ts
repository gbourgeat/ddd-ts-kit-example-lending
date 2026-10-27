export abstract class ScreeningProvider {
  /** Asks the outside screening whether a person appears on the sanctions or politically exposed lists. */
  abstract screen(name: string, birthDate: Date): Promise<{ readonly possibleMatch: boolean }>;
}
