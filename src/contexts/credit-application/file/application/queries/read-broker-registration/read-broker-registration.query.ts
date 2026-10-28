import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadBrokerRegistrationResult } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.result';

/** The registration of one broker, read by a decider: whether it is in force, and since or until when. */
export class ReadBrokerRegistrationQuery extends AuthorizedQuery<ReadBrokerRegistrationResult> {
  constructor(
    actor: Actor,
    readonly brokerId: string,
  ) {
    super(actor);
  }
}
