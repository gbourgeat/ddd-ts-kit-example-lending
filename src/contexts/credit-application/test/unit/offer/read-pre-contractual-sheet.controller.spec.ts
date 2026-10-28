import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadPreContractualSheetQuery } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.query';
import { ReadPreContractualSheetController } from '@/contexts/credit-application/offer/presentation/http/offers/read-pre-contractual-sheet/read-pre-contractual-sheet.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /offers/:id/pre-contractual-sheet', () => {
  it('answers 200 when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(ReadPreContractualSheetQuery, {
      execute: async () => ({
        offerId: 'offer-1',
        applicationId: 'application-1',
        amountCents: 1_000_000,
        durationMonths: 60,
        rateBasisPoints: 590,
        annualPercentageRate: '6.1',
        instalmentCents: 19_286,
        arrangementFeeCents: 0,
        totalToRepayCents: 1_157_160,
      }),
    });

    const route = nestControllerRoute(ReadPreContractualSheetController, {
      instanceOf: () => new ReadPreContractualSheetController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/offers/:id/pre-contractual-sheet');
    expect(creditApplicationControllers).toContain(ReadPreContractualSheetController);
  });
});
