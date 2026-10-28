import type { HttpClient } from '@ddd-ts-kit/testing/e2e';

/** What the API answers to a request for `text/csv`: the status, the media type it says and the text it writes. */
export interface CsvAnswer {
  readonly status: number;
  readonly contentType: string | undefined;
  readonly text: string;
}

/** Asks `path` for `text/csv`, as a spreadsheet does, and returns the answer as it is: the status, the media type and the text. */
export async function getCsv(reader: HttpClient, path: string): Promise<CsvAnswer> {
  const response = await reader.get<unknown>(path, { headers: { accept: 'text/csv' } });

  return {
    status: response.status,
    contentType: response.headers['content-type'],
    text: typeof response.body === 'string' ? response.body : '',
  };
}

/** The lines of a CSV text, without the empty line that closes it: the header first, then one line per row. */
export function csvLines(text: string): readonly string[] {
  return text.split('\r\n').filter((line) => line !== '');
}
