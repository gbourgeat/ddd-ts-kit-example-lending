import type { SignedUrl } from '@ddd-ts-kit/kernel';

/** The copy the customer asked for: its identifier, and the link that downloads it until the link expires. */
export interface IssuedPersonalDataCopy {
  readonly copyId: string;
  readonly link: SignedUrl;
}
