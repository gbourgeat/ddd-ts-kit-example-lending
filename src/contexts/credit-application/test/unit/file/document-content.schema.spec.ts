import { Readable } from 'node:stream';
import { describe, expect, it } from '@jest/globals';
import { documentContent } from '@/contexts/credit-application/presentation/http/shared/document-content.schema';

describe('documentContent', () => {
  it('accepts the bytes of a document as they stream', () => {
    const stream = Readable.from(['%PDF-1.7']);

    expect(documentContent().parse(stream)).toEqual({ ok: true, value: stream });
  });

  it('refuses anything that is not a stream, with invalid_stream', () => {
    expect(documentContent().parse('%PDF-1.7')).toEqual({
      ok: false,
      error: [{ path: '', code: 'invalid_stream', message: 'The content of a document is expected as a stream.' }],
    });
  });
});
