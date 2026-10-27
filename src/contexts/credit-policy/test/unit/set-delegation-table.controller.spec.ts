import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { SetDelegationTableCommand } from '@/contexts/credit-policy/application/commands/set-delegation-table/set-delegation-table.command';
import { SetDelegationTableController } from '@/contexts/credit-policy/presentation/http/delegation-table/set-delegation-table/set-delegation-table.controller';
import { creditPolicyControllers } from '@/contexts/credit-policy/credit-policy.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const validBody = {
  effectiveFrom: '2026-08-01',
  advisorLimitCents: 1_500_000,
  creditAnalystLimitCents: 7_500_000,
  riskManagerLimitCents: 25_000_000,
  creditCommitteeLimitCents: 100_000_000,
};

describe('PUT /delegation-table', () => {
  it('answers with the table identifier and hands the four limits of the body to the use case', async () => {
    const received: SetDelegationTableCommand[] = [];

    const commands = new InMemoryCommandBus().register(SetDelegationTableCommand, {
      execute: async (command: SetDelegationTableCommand) => {
        received.push(command);

        return 'delegation-table-1';
      },
    });

    const route = nestControllerRoute(SetDelegationTableController, {
      instanceOf: () => new SetDelegationTableController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: validBody, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/delegation-table');
    expect(received[0]?.terms.limits).toHaveLength(4);
    expect(creditPolicyControllers).toContain(SetDelegationTableController);
  });

  it('refuses a body without its limits with 422, before the use case runs', async () => {
    const commands = new InMemoryCommandBus().register(SetDelegationTableCommand, {
      execute: async () => 'never-called',
    });

    const route = nestControllerRoute(SetDelegationTableController, {
      instanceOf: () => new SetDelegationTableController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { effectiveFrom: '2026-08-01' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
