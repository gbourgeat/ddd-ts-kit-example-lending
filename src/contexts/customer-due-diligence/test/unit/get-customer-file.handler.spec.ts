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
const LINES: readonly GetCustomerFileItem[] = SEARCHED.map((id) => ({ id }));

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

  // TODO(domain): replace each entry below by a test named after what "get customer file" shows and to whom.
  it.todo('lists only what the access scope of the actor covers');
  it.todo('applies each criterion of the query');
});

function arrange(lines: readonly GetCustomerFileItem[]) {
  const { queryBus } = createTestBuses();
  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new GetCustomerFileHandler(new FakeGetCustomerFileReader(lines), access);

  return queryBus.use(holders).register(GetCustomerFileQuery, handler);
}
