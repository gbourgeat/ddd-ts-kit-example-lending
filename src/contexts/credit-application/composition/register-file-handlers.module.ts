import { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';
import { GiveAccountConsentHandler } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.handler';
import { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';
import { NameCoBorrowerHandler } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.handler';
import { NameGuarantorCommand } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.command';
import { NameGuarantorHandler } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.handler';
import { CorrectEntryCommand } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.command';
import { CorrectEntryHandler } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.handler';
import { AttachDocumentCommand } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.command';
import { AttachDocumentHandler } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.handler';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { Platform } from '@/platform/composition/platform';

/** The commands of the file module that act on the application file alone. */
export function registerFileHandlers(
  platform: Platform,
  creditApplicationRepository: CreditApplicationRepository,
): void {
  platform.commands.register(
    GiveAccountConsentCommand,
    new GiveAccountConsentHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    NameCoBorrowerCommand,
    new NameCoBorrowerHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    NameGuarantorCommand,
    new NameGuarantorHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    CorrectEntryCommand,
    new CorrectEntryHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    AttachDocumentCommand,
    new AttachDocumentHandler(creditApplicationRepository, platform.clock, platform.files.staging),
    {
      context: 'credit-application',
    },
  );
}
