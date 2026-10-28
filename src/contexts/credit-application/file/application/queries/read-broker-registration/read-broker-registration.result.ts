/** The registration of a broker as the read model holds it: in force since an instant, or lapsed at an instant. */
export interface ReadBrokerRegistrationResult {
  readonly brokerId: string;
  readonly inForce: boolean;
  /** The instant the registration came into force, when it is in force. */
  readonly since?: string;
  /** The instant the registration lapsed, when it has. */
  readonly until?: string;
}
