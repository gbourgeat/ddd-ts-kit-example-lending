/** The findings of the checks of the application against its product: `terms-unknown` carries no limit, `outside-limit` names the limit it breaks. */
export class ReadProductTermsFindingsAnswer {
  declare readonly findings: readonly {
    readonly kind: 'outside-limit' | 'terms-unknown';
    readonly productId: string;
    readonly term?: 'amount' | 'duration';
    readonly bound?: 'maximum' | 'minimum';
    readonly requested?: number;
    readonly limit?: number;
  }[];
}
