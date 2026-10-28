import { AuthorizedCommand } from '@ddd-ts-kit/kernel';

export class ErasePersonalDataPastRetentionCommand extends AuthorizedCommand<string> {
  // TODO(domain): name the application this command is about, `{ type: 'application', id: command.applicationId }`, once its constructor declares it, and derive 'application.erase-past-retention' on that type in the relationship schema; the context is the resource of a use case on no element.
  // TODO(domain): declare the input of "erase personal data past retention" as a constructor with the actor first, then readonly primitives and ids, for example `constructor(actor: Actor, readonly customerId: string) { super(actor); }`; the handler turns them into value objects.
}
