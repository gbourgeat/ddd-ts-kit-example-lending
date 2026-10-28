const BOUNDARY = 'ddd-ts-kit-document-boundary';

/** The body of a multipart request carrying the file under the field `file` the route declares. */
export function multipartFile(
  fileName: string,
  mediaType: string,
  content: string,
): { body: string; contentType: string } {
  const body = [
    `--${BOUNDARY}`,
    `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
    `Content-Type: ${mediaType}`,
    '',
    content,
    `--${BOUNDARY}--`,
    '',
  ].join('\r\n');

  return { body, contentType: `multipart/form-data; boundary=${BOUNDARY}` };
}
