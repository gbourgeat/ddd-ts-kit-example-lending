import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';

export class ProductBoundsInverted extends DomainRefusal {
  readonly code = CreditPolicyCodes.ProductBoundsInverted;

  static onAmount(minimum: number, maximum: number) {
    return ProductBoundsInverted.refusal('The minimum amount of a product is above its maximum.', {
      minimum,
      maximum,
    }).exposing('minimum', 'maximum');
  }

  static onDuration(minimum: number, maximum: number) {
    return ProductBoundsInverted.refusal('The minimum duration of a product is above its maximum.', {
      minimum,
      maximum,
    }).exposing('minimum', 'maximum');
  }
}
