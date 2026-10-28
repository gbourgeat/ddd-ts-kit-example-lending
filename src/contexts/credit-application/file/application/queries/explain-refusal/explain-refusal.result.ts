/** The application may be read: the answer carries no content of it. A refusal to read it is an error, never an answer. */
export interface ExplainRefusalResult {
  readonly outcome: 'visible';
}
