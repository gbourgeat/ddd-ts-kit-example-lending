import { Readable } from 'node:stream';
import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryFileStorage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { ReadDocumentHandler } from '@/contexts/credit-application/file/application/queries/read-document/read-document.handler';
import { ReadDocumentQuery } from '@/contexts/credit-application/file/application/queries/read-document/read-document.query';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const APPLICATION_ID = 'credit-application-1';
const DOCUMENT_KEY = 'files/attach-document/payslip-1.pdf';
const PDF = '%PDF-1.7\n%%EOF\n';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.read']] },
  }),
  map: AuthorizationMap.of(requires(ReadDocumentQuery, creditApplicationPermissions['application.read'])),
});

const broker = anActor().withRole('holder').build();

describe('Read document', () => {
  it('answers the stored content of the document, with its media type and its size', async () => {
    const { queryBus } = await arrange();

    const { content } = await queryBus.execute(new ReadDocumentQuery(broker, APPLICATION_ID, DOCUMENT_KEY));

    expect(Buffer.concat(await content.stream.toArray()).toString()).toBe(PDF);
    expect(content.metadata).toMatchObject({ mediaType: 'application/pdf', size: PDF.length });
  });

  it('refuses a document key that the file does not hold, with UNKNOWN_ENTRY', async () => {
    const { queryBus } = await arrange();

    await expect(
      queryBus.execute(new ReadDocumentQuery(broker, APPLICATION_ID, 'files/attach-document/other.pdf')),
    ).rejects.toMatchObject({ code: 'UNKNOWN_ENTRY' });
  });

  it('refuses an application that does not exist, with UNKNOWN_CREDIT_APPLICATION', async () => {
    const { queryBus } = await arrange();

    await expect(
      queryBus.execute(new ReadDocumentQuery(broker, 'credit-application-unknown', DOCUMENT_KEY)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('is refused to an actor who does not hold the permission application.read, with FORBIDDEN', async () => {
    const { queryBus } = await arrange();
    const query = new ReadDocumentQuery(anActor().build(), APPLICATION_ID, DOCUMENT_KEY);

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An application holding one document, its content in the object store, and the bus that reads it back. */
async function arrange() {
  const { queryBus, clock } = createTestBuses({ idPrefix: 'file' });
  const creditApplicationRepository = new FakeCreditApplicationRepository();
  const storage = new InMemoryFileStorage({ clock });

  const application = CreditApplication.create(APPLICATION_ID, 'ada', {
    amount: Money.ofCents(1234567),
    durationMonths: 60,
    registeredAt: clock.now(),
    branchId: 'branch-1',
  });

  application.attachDocument({ key: DOCUMENT_KEY, mediaType: 'application/pdf', sizeBytes: PDF.length }, clock.now());
  await creditApplicationRepository.save(application);
  await storage.put(DOCUMENT_KEY, Readable.from([Buffer.from(PDF)]), { mediaType: 'application/pdf' });

  queryBus.use(holders).register(ReadDocumentQuery, new ReadDocumentHandler(creditApplicationRepository, storage));

  return { queryBus };
}
