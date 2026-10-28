import { type ProductDefinedV2 } from '@/contexts/credit-policy/published-language';

// TODO(domain): receive the port of the read model "product terms" keeps in the constructor, typed by that port (an abstract class of application/ports that extends `ReadModelStore<Row>` of the kernel: `ddd-ts-kit generate port credit-application <Name>`), and pass the adapter (or its fake) where the module file of the context builds the projection.
export class ProductTermsProjection {
  async defined(event: ProductDefinedV2): Promise<void> {
    // TODO(domain): write what credit-policy.product.defined says into the read model through its port and answer what the store answers, `return this.<port>.upsertIfNewer(<id>, stampOf(event), () => ({ ... }))` with `stampOf` of the kernel: the stamp keeps a replay or a late delivery from undoing a newer line, and the answer is how the application counts what was applied.
  }
}
