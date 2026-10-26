import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { AccountDeactivatedV1Payload } from '@/contexts/identity/published-language/account-deactivated.v1.payload';

export const accountDeactivatedV1 = defineIntegrationEvent({
  type: 'identity.account.deactivated',
  version: 1,
  description: 'An account was deactivated: its person signs in no more, and every context stops acting for it.',
  payload: classSchema(AccountDeactivatedV1Payload),
});

export type AccountDeactivatedV1 = IntegrationEvent<AccountDeactivatedV1Payload>;
