import { type DelegationTablePublishedV2 } from '@/contexts/credit-policy/published-language';

// TODO(domain): receive the port of the read model "delegation table" keeps in the constructor, typed by that port (an abstract class of application/ports that extends `ReadModelStore<Row>` of the kernel: `ddd-ts-kit generate port credit-application <Name>`), and pass the adapter (or its fake) where the module file of the context builds the projection.
export class DelegationTableProjection {
  async published(event: DelegationTablePublishedV2): Promise<void> {
    // TODO(domain): write what credit-policy.delegation-table.published says into the read model through its port and answer what the store answers, `return this.<port>.upsertIfNewer(<id>, stampOf(event), () => ({ ... }))` with `stampOf` of the kernel: the stamp keeps a replay or a late delivery from undoing a newer line, and the answer is how the application counts what was applied.
  }
}
