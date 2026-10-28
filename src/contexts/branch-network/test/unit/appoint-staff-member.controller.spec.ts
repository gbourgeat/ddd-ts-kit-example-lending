import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AppointStaffMemberCommand } from '@/contexts/branch-network/application/commands/appoint-staff-member/appoint-staff-member.command';
import { BranchNotOpened } from '@/contexts/branch-network/domain/errors/branch-not-opened.error';
import { AppointStaffMemberController } from '@/contexts/branch-network/presentation/http/branches/appoint-staff-member/appoint-staff-member.controller';
import { branchNetworkControllers } from '@/contexts/branch-network/branch-network.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /branches/:id/staff', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(AppointStaffMemberCommand, {
      execute: async () => 'appoint-staff-member-1',
    });

    const route = nestControllerRoute(AppointStaffMemberController, {
      instanceOf: () => new AppointStaffMemberController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { name: 'Ada Lovelace', email: 'ada.lovelace@bank.test', accountId: 'account-ada', level: 'advisor' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/branches/:id/staff');
    expect(branchNetworkControllers).toContain(AppointStaffMemberController);
  });

  it('refuses a body whose email is not an email address with 422', async () => {
    const commands = new InMemoryCommandBus().register(AppointStaffMemberCommand, {
      execute: async () => 'appoint-staff-member-1',
    });

    const route = nestControllerRoute(AppointStaffMemberController, {
      instanceOf: () => new AppointStaffMemberController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { name: 'Ada Lovelace', email: 'not-an-email' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers 422 when the branch is not opened, with the code BRANCH_NOT_OPENED', async () => {
    const commands = new InMemoryCommandBus().register(AppointStaffMemberCommand, {
      execute: async (command) => {
        throw BranchNotOpened.forBranch(command.branchId);
      },
    });

    const route = nestControllerRoute(AppointStaffMemberController, {
      instanceOf: () => new AppointStaffMemberController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'branch-9' },
        query: {},
        headers: {},
        body: { name: 'Ada Lovelace', email: 'ada.test' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
