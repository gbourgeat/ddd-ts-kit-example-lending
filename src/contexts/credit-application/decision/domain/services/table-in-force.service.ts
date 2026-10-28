/** The delegation table in force on a day: the one of the latest date of effect that is not after that day. */
export class TableInForce {
  of<Table extends { readonly effectiveFrom: Date }>(tables: readonly Table[], day: Date): Table | undefined {
    return tables
      .filter((table) => table.effectiveFrom.getTime() <= day.getTime())
      .reduce<Table | undefined>(
        (latest, table) => (latest === undefined || table.effectiveFrom > latest.effectiveFrom ? table : latest),
        undefined,
      );
  }
}
