import { Readable } from 'node:stream';
import { err, ok } from '@ddd-ts-kit/kernel';
import { customSchema, type Schema } from '@ddd-ts-kit/validation';

/** The bytes of a document as they are streamed: a readable stream, described in the contract as a binary file. */
export function documentContent(): Schema<Readable> {
  return customSchema(
    (input) =>
      input instanceof Readable
        ? ok(input)
        : err([{ path: '', code: 'invalid_stream', message: 'The content of a document is expected as a stream.' }]),
    { type: 'string', format: 'binary' },
  );
}
