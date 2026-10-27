import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Branch } from '@/contexts/branch-network/domain/aggregates/branch.aggregate';
import type { BranchRepository } from '@/contexts/branch-network/domain/repositories/branch.repository';
import type { OpenBranchCommand } from '@/contexts/branch-network/application/commands/open-branch/open-branch.command';

export class OpenBranchHandler implements CommandHandler<OpenBranchCommand> {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: OpenBranchCommand): Promise<string> {
    const branch = Branch.create(this.ids.next(), this.clock.now());

    await this.branchRepository.save(branch);

    return branch.id;
  }
}
