import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { ProductDefinedV1Payload } from '@/contexts/credit-policy/published-language/product-defined.v1.payload';

export const productDefinedV1 = defineIntegrationEvent({
  type: 'credit-policy.product.defined',
  version: 1,
  description:
    'A product of the bank catalogue has been defined; the other contexts read its terms from credit-policy by its identifier.',
  payload: classSchema(ProductDefinedV1Payload),
});

export type ProductDefinedV1 = IntegrationEvent<ProductDefinedV1Payload>;
