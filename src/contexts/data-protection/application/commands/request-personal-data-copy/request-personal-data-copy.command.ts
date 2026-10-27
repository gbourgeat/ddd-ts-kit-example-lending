import { AuthorizedCommand } from '@ddd-ts-kit/kernel';

export class RequestPersonalDataCopyCommand extends AuthorizedCommand<void> {
  // TODO(domain): name the data-subject this command is about, `{ type: 'data-subject', id: command.dataSubjectId }`, once its constructor declares it, and derive 'data-subject.request-copy' on that type in the relationship schema; the context is the resource of a use case on no element.
  // TODO(domain): declare the input of "request personal data copy" as a constructor with the actor first, then readonly primitives and ids, for example `constructor(actor: Actor, readonly customerId: string) { super(actor); }`; the handler turns them into value objects.
}
