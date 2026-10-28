import { Readable } from 'node:stream';
import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import {
  AcceptEveryFileScanner,
  FileStaging,
  InMemoryErrorReporter,
  InMemoryFileStorage,
  TenantFileKeys,
  fileUploadsMiddleware,
} from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationDocumentAttached } from '@/contexts/credit-application/file/domain/events/credit-application-document-attached.event';
import { AttachDocumentCommand } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.command';
import { AttachDocumentHandler } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const APPLICATION_ID = 'credit-application-1';
const PDF = '%PDF-1.7\n%%EOF\n';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.attach-document']] },
  }),
  map: AuthorizationMap.of(
    requires(AttachDocumentCommand, creditApplicationPermissions['application.attach-document']),
  ),
});

const applicant = anActor().withRole('holder').build();

describe('Attach document', () => {
  it('records the reference of the file on the application, and keeps the content visible in the object store', async () => {
    const { commandBus, creditApplicationRepository, storage } = await arrange();

    const id = await commandBus.execute(new AttachDocumentCommand(applicant, APPLICATION_ID, aFile()));
    const stored = await creditApplicationRepository.findById(id);
    const [documentKey] = stored?.toState().documentKeys ?? [];

    expect(id).toBe(APPLICATION_ID);
    expect(stored?.toState().documentKeys).toHaveLength(1);
    expect(stored?.toState().entryCount).toBe(2);
    expect(storage.keys()).toEqual([documentKey]);
    expect(await storage.stat(documentKey ?? '')).toMatchObject({ size: PDF.length, mediaType: 'application/pdf' });
  });

  it('announces the attachment with the key, the media type and the size of the document', async () => {
    const { commandBus, clock, announced } = await arrange();
    const attachedAt = clock.now();

    await commandBus.execute(new AttachDocumentCommand(applicant, APPLICATION_ID, aFile()));

    expect(announced).toHaveLength(1);

    expect(announced[0]).toMatchObject({
      aggregateId: APPLICATION_ID,
      occurredAt: attachedAt,
      mediaType: 'application/pdf',
      sizeBytes: PDF.length,
    });
  });

  it('keeps the documents already attached, and adds the new one after them', async () => {
    const { commandBus, creditApplicationRepository } = await arrange();

    await commandBus.execute(new AttachDocumentCommand(applicant, APPLICATION_ID, aFile()));
    await commandBus.execute(new AttachDocumentCommand(applicant, APPLICATION_ID, aFile()));
    const stored = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(stored?.toState().documentKeys).toHaveLength(2);
    expect(stored?.toState().entryCount).toBe(3);
  });

  it('refuses a document for an application that does not exist, with UNKNOWN_CREDIT_APPLICATION, and announces nothing', async () => {
    const { commandBus, announced } = await arrange();

    await expect(
      commandBus.execute(new AttachDocumentCommand(applicant, 'credit-application-404', aFile())),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });

    expect(announced).toHaveLength(0);
  });

  it('leaves the file of a refused command out of the file of the application, and the application unchanged', async () => {
    const { commandBus, creditApplicationRepository, storage } = await arrange();

    await expect(
      commandBus.execute(new AttachDocumentCommand(applicant, 'credit-application-404', aFile())),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });

    const stored = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(stored?.toState().documentKeys).toEqual([]);
    expect(storage.keys().every((key) => !key.startsWith('files/'))).toBe(true);
  });

  it('is refused to an actor who does not hold the permission application.attach-document, and keeps nothing', async () => {
    const { commandBus, storage } = await arrange();
    const command = new AttachDocumentCommand(anActor().build(), APPLICATION_ID, aFile());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(storage.keys()).toEqual([]);
  });
});

function aFile() {
  return { fileName: 'scan.pdf', mediaType: 'application/pdf', stream: Readable.from([Buffer.from(PDF)]) };
}

/** An application submitted and saved, then the bus that attaches its documents to it. */
async function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'file' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const storage = new InMemoryFileStorage({ clock });
  const staging = new FileStaging(storage, new AcceptEveryFileScanner(), new InMemoryErrorReporter());
  const keys = new TenantFileKeys(ids, clock);
  const announced: unknown[] = [];

  domainEvents.on(CreditApplicationDocumentAttached.eventName, async (event) => {
    announced.push(event);
  });

  const application = CreditApplication.create(APPLICATION_ID, 'ada', {
    amount: Money.ofCents(1234567),
    durationMonths: 60,
    registeredAt: clock.now(),
  });

  await creditApplicationRepository.save(application);

  commandBus
    .use(holders)
    .use(fileUploadsMiddleware(() => ({ keys, staging })))
    .register(AttachDocumentCommand, new AttachDocumentHandler(creditApplicationRepository, clock, staging));

  return { commandBus, clock, creditApplicationRepository, storage, announced };
}
