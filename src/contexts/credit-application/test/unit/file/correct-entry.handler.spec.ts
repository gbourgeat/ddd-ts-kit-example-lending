import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';
import { CorrectEntryCommand } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.command';
import { CorrectEntryHandler } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const APPLICATION_ID = 'credit-application-1';
const OTHER_APPLICATION_ID = 'credit-application-2';
const GUARANTOR_ENTRY = `${APPLICATION_ID}#3`;
const REASON = 'The guarantor was named by mistake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.correct']] },
  }),
  map: AuthorizationMap.of(requires(CorrectEntryCommand, creditApplicationPermissions['application.correct'])),
});

const applicant = anActor().withRole('holder').build();

describe('Correct entry', () => {
  it('records the correction after the entry, naming it and saying why, and answers the application identifier', async () => {
    const { commandBus, creditApplicationRepository } = await arrange();

    const id = await commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, GUARANTOR_ENTRY, REASON));
    const stored = await creditApplicationRepository.findById(id);

    expect(id).toBe(APPLICATION_ID);
    expect(stored?.toState().correctedEntryIds).toEqual([GUARANTOR_ENTRY]);
    expect(stored?.toState().entryCount).toBe(4);
  });

  it('announces the correction with the entry it corrects and the reason', async () => {
    const { commandBus, clock, announced } = await arrange();
    const correctedAt = clock.now();

    await commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, GUARANTOR_ENTRY, REASON));

    expect(announced).toHaveLength(1);

    expect(announced[0]).toMatchObject({
      aggregateId: APPLICATION_ID,
      occurredAt: correctedAt,
      correctedEntryId: GUARANTOR_ENTRY,
      reason: REASON,
    });
  });

  it('refuses a second correction of the same entry with CORRECTION_ALREADY_RECORDED, and keeps the first one', async () => {
    const { commandBus, creditApplicationRepository, announced } = await arrange();

    await commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, GUARANTOR_ENTRY, REASON));

    await expect(
      commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, GUARANTOR_ENTRY, 'Another reason')),
    ).rejects.toMatchObject({ code: 'CORRECTION_ALREADY_RECORDED' });

    const stored = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(stored?.toState().correctedEntryIds).toEqual([GUARANTOR_ENTRY]);
    expect(announced).toHaveLength(1);
  });

  it('refuses the correction of an entry of another application with UNKNOWN_ENTRY, and announces nothing', async () => {
    const { commandBus, announced } = await arrange();

    await expect(
      commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, `${OTHER_APPLICATION_ID}#1`, REASON)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_ENTRY' });

    expect(announced).toHaveLength(0);
  });

  it('refuses the correction of an entry that the file does not hold, with UNKNOWN_ENTRY', async () => {
    const { commandBus } = await arrange();

    await expect(
      commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, `${APPLICATION_ID}#9`, REASON)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_ENTRY' });
  });

  it('refuses a correction without a reason, with INVALID_CORRECTION_REASON', async () => {
    const { commandBus, announced } = await arrange();

    await expect(
      commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, GUARANTOR_ENTRY, '   ')),
    ).rejects.toMatchObject({ code: 'INVALID_CORRECTION_REASON' });

    expect(announced).toHaveLength(0);
  });

  it('leaves the corrected entry unchanged: the guarantor it named is still the one named', async () => {
    const { commandBus, creditApplicationRepository } = await arrange();

    await commandBus.execute(new CorrectEntryCommand(applicant, APPLICATION_ID, GUARANTOR_ENTRY, REASON));
    const stored = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(stored?.guarantorIds).toEqual(['customer-4']);
  });

  it('refuses a correction for an application that does not exist, with UNKNOWN_CREDIT_APPLICATION', async () => {
    const { commandBus, announced } = await arrange();

    await expect(
      commandBus.execute(new CorrectEntryCommand(applicant, 'credit-application-404', GUARANTOR_ENTRY, REASON)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });

    expect(announced).toHaveLength(0);
  });

  it('is refused to an actor who does not hold the permission application.correct', async () => {
    const { commandBus } = await arrange();
    const command = new CorrectEntryCommand(anActor().build(), APPLICATION_ID, GUARANTOR_ENTRY, REASON);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An application submitted, with a consent and a guarantor named (entries 1 to 3), saved before the correction. */
async function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const announced: unknown[] = [];

  domainEvents.on(CreditApplicationEntryCorrected.eventName, async (event) => {
    announced.push(event);
  });

  const application = CreditApplication.create(APPLICATION_ID, 'ada', {
    amount: Money.ofCents(1234567),
    durationMonths: 60,
    registeredAt: clock.now(),
    branchId: 'branch-1',
  });

  application.giveAccountConsent(clock.now());
  application.nameGuarantor('customer-4', clock.now());
  await creditApplicationRepository.save(application);

  commandBus.use(holders).register(CorrectEntryCommand, new CorrectEntryHandler(creditApplicationRepository, clock));

  return { commandBus, clock, creditApplicationRepository, announced };
}
