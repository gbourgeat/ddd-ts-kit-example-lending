import { PersonalDataErasure } from '@ddd-ts-kit/kernel';

/**
 * The right to erasure, for what identity keeps of a person in clear: the columns its tables declare
 * with `personalFields`, erased or pseudonymised as each declaration says. Run by the platform
 * (`npm run privacy:erase`) with the copies of the other contexts, never by a use case.
 */
export abstract class IdentityPersonalDataErasure extends PersonalDataErasure {}
