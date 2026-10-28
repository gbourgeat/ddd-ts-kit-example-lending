import { AuthorizedCommand } from '@ddd-ts-kit/kernel';

export class ClassifyArrearsCommand extends AuthorizedCommand<void> {
  // TODO(domain): name the loan this command is about, `{ type: 'loan', id: command.loanId }`, once its constructor declares it, and derive 'loan.classify-arrears' on that type in the relationship schema; the context is the resource of a use case on no element.
  // TODO(domain): declare the input of "classify arrears" as a constructor with the actor first, then readonly primitives and ids, for example `constructor(actor: Actor, readonly customerId: string) { super(actor); }`; the handler turns them into value objects.
}
