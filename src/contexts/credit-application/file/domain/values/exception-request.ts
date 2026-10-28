/** An exception to the policy requested on an application: who asked, the level it goes to, why, and when. */
export interface ExceptionRequest {
  readonly requesterId: string;
  readonly targetLevel: string;
  readonly justification: string;
  readonly requestedAt: Date;
}
