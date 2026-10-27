import { describe, expect, it } from '@jest/globals';
import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock, offsetPage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { GetCustomerFileHandler } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.handler';
import { GetCustomerFileQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.query';
import type { GetCustomerFileItem } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';
import { FakeGetCustomerFileReader } from '@/contexts/customer-due-diligence/test/fakes/get-customer-file-reader.fake';

const authorizer = new RoleBasedAuthorizer({
  roles: { holder: [customerDueDiligencePermissions['customer.read']] },
});

const holders = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(requires(GetCustomerFileQuery, customerDueDiligencePermissions['customer.read'])),
});

const holder = anActor().withRole('holder').build();
const SEARCHED = ['customer-1', 'customer-2', 'customer-3'];
const identifiedOn = new Date('2026-01-01T00:00:00.000Z');
const LINES: readonly GetCustomerFileItem[] = SEARCHED.map((id) => ({ id, identifiedAt: identifiedOn }));

describe('Get customer file', () => {
  it('answers one page of what the actor may see, with the total', async () => {
    const queryBus = arrange(LINES);
    const query = new GetCustomerFileQuery(holder, offsetPage({ limit: 2 }));

    const page = await queryBus.execute(query);

    expect(page).toEqual({ items: LINES.slice(0, 2), total: 3 });
  });

  it('is refused to an actor who does not hold the permission customer.read', async () => {
    const queryBus = arrange(LINES);
    const query = new GetCustomerFileQuery(anActor().build(), offsetPage());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('asks the reader for the access scope of the actor, and shows the files that scope covers', async () => {
    const reader = new FakeGetCustomerFileReader(LINES);
    const queryBus = arrangeWith(reader);

    const page = await queryBus.execute(new GetCustomerFileQuery(holder, offsetPage()));

    expect(reader.lastScope?.kind).toBe('all');
    expect(page.items).toHaveLength(3);
  });

  it('shows each file with the day its customer was identified', async () => {
    const queryBus = arrange(LINES);

    const page = await queryBus.execute(new GetCustomerFileQuery(holder, offsetPage({ limit: 1 })));

    expect(page.items).toEqual([{ id: 'customer-1', identifiedAt: identifiedOn }]);
  });
});

function arrange(lines: readonly GetCustomerFileItem[]) {
  return arrangeWith(new FakeGetCustomerFileReader(lines));
}

function arrangeWith(reader: FakeGetCustomerFileReader) {
  const { queryBus } = createTestBuses();
  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new GetCustomerFileHandler(reader, access);

  return queryBus.use(holders).register(GetCustomerFileQuery, handler);
}
