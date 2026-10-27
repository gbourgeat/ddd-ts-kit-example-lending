import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ConflictOnOwnRecord } from '@/contexts/branch-network/domain/errors/conflict-on-own-record.error';
import { UnknownStaffMember } from '@/contexts/branch-network/domain/errors/unknown-staff-member.error';
import { DeclareConflictOfInterestCommand } from '@/contexts/branch-network/application/commands/declare-conflict-of-interest/declare-conflict-of-interest.command';
import { DeclareConflictOfInterestController } from '@/contexts/branch-network/presentation/http/conflicts/declare-conflict-of-interest/declare-conflict-of-interest.controller';
import { branchNetworkControllers } from '@/contexts/branch-network/branch-network.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /conflicts', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(DeclareConflictOfInterestCommand, {
      execute: async () => 'declare-conflict-of-interest-1',
    });

    const route = nestControllerRoute(DeclareConflictOfInterestController, {
      instanceOf: () => new DeclareConflictOfInterestController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { customerId: 'customer-1' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/conflicts');
    expect(branchNetworkControllers).toContain(DeclareConflictOfInterestController);
  });

  it('refuses a body whose customer identifier is not a string with 422', async () => {
    const commands = new InMemoryCommandBus().register(DeclareConflictOfInterestCommand, {
      execute: async () => 'declare-conflict-of-interest-1',
    });

    const route = nestControllerRoute(DeclareConflictOfInterestController, {
      instanceOf: () => new DeclareConflictOfInterestController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { customerId: 42 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers 422 when the declarer is not a member of staff, with the code UNKNOWN_STAFF_MEMBER', async () => {
    const commands = new InMemoryCommandBus().register(DeclareConflictOfInterestCommand, {
      execute: async (command) => {
        throw UnknownStaffMember.forStaffMember(command.actor.id);
      },
    });

    const route = nestControllerRoute(DeclareConflictOfInterestController, {
      instanceOf: () => new DeclareConflictOfInterestController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { customerId: 'customer-1' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers 422 when the customer is the declarer own file, with the code CONFLICT_ON_OWN_RECORD', async () => {
    const commands = new InMemoryCommandBus().register(DeclareConflictOfInterestCommand, {
      execute: async (command) => {
        throw ConflictOnOwnRecord.forCustomer(command.customerId);
      },
    });

    const route = nestControllerRoute(DeclareConflictOfInterestController, {
      instanceOf: () => new DeclareConflictOfInterestController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { customerId: 'customer-1' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
