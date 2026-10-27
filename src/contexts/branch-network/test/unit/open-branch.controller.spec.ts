import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { OpenBranchCommand } from '@/contexts/branch-network/application/commands/open-branch/open-branch.command';
import { OpenBranchController } from '@/contexts/branch-network/presentation/http/branches/open-branch/open-branch.controller';
import { branchNetworkControllers } from '@/contexts/branch-network/branch-network.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /branches', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(OpenBranchCommand, {
      execute: async () => 'open-branch-1',
    });

    const route = nestControllerRoute(OpenBranchController, {
      instanceOf: () => new OpenBranchController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/branches');
    expect(branchNetworkControllers).toContain(OpenBranchController);
  });

  it('answers the identifier of the branch it opened', async () => {
    const commands = new InMemoryCommandBus().register(OpenBranchCommand, {
      execute: async () => 'open-branch-1',
    });

    const route = nestControllerRoute(OpenBranchController, {
      instanceOf: () => new OpenBranchController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toEqual({ id: 'open-branch-1' });
  });

  it('sends one command to open a branch to the bus for each request', async () => {
    const sent: OpenBranchCommand[] = [];

    const commands = new InMemoryCommandBus().register(OpenBranchCommand, {
      execute: async (command: OpenBranchCommand) => {
        sent.push(command);

        return 'open-branch-1';
      },
    });

    const route = nestControllerRoute(OpenBranchController, {
      instanceOf: () => new OpenBranchController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(sent).toHaveLength(1);
    expect(sent[0]).toBeInstanceOf(OpenBranchCommand);
  });
});
