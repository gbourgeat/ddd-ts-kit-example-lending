/** How an optional part of the state is stored: as a list of no entry or one. */
export const optionalPart = {
  /** The entry of a list holding the optional part, read by `read`; undefined when the part is absent. */
  atMostOne<T, R>(entries: readonly T[], read: (entry: T) => R): R | undefined {
    const [entry] = entries;

    return entry === undefined ? undefined : read(entry);
  },

  /** The list holding the optional part, or no entry when it is absent. */
  listOf<T, R>(part: T | undefined, encode: (part: T) => R): R[] {
    return part === undefined ? [] : [encode(part)];
  },
};
