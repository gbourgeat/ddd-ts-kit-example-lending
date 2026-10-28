import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { ProductDefinedV2Payload } from '@/contexts/credit-policy/published-language/product-defined.v2.payload';

export const productDefinedV2 = defineIntegrationEvent({
  type: 'credit-policy.product.defined',
  version: 2,
  description: 'A product was defined, with the amounts, durations, arrangement fee and insurance it is sold with.',
  payload: classSchema(ProductDefinedV2Payload),
});

export type ProductDefinedV2 = IntegrationEvent<ProductDefinedV2Payload>;
