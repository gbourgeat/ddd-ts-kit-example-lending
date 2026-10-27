import { defineSchema, via, type SchemaDefinition } from '@ddd-ts-kit/auth/rebac';
import { permissions } from '@/platform/auth/authorization/permissions';

/**
 * The elements rights are shared on (documents, folders, teams): a type each, with who is what to
 * it (the relations, stored as tuples) and which permission it grants (a derived relation named
 * after a permission id grants it on that type). A permission derived on an element leaves the
 * context below: the operators of the context no longer hold it, so name that element in the
 * `resource` of the requirement, never the context.
 *
 * The bank > branch > portfolio > customer > application > loan chain: a bank has branches, a
 * branch portfolios, a portfolio customers (through the advisor who holds it), a customer
 * applications, an application loans. A derived relation reaches the element it is about through
 * the chain, never through a copy of the facts.
 */
const elements: SchemaDefinition = {
  bank: {
    relations: { member: ['user'] },
  },
  branch: {
    relations: { bank: ['bank'], manager: ['user'] },
    derived: {
      'branch-network:staff-member.list': 'manager',
    },
  },
  portfolio: {
    relations: { branch: ['branch'], advisor: ['user'], member: ['customer'] },
  },
  customer: {
    relations: { self: ['user'], portfolio: ['portfolio'], conflicted: ['user'] },
    derived: {
      'credit-application:application.submit': 'self',
      'data-protection:data-subject.request-copy': 'self',
      advisor: via('portfolio', 'advisor'),
    },
  },
  application: {
    relations: { customer: ['customer'], 'co-borrower': ['user'], broker: ['user'] },
    derived: {
      'credit-application:application.consent': via('customer', 'self'),
      'credit-application:application.name-party': via('customer', 'self'),
      'credit-application:application.read': {
        anyOf: [via('customer', 'advisor'), 'co-borrower', 'broker'],
        butNot: [via('customer', 'conflicted')],
      },
    },
  },
  loan: {
    relations: { application: ['application'] },
    derived: {
      'servicing:loan.read': via('application', 'credit-application:application.read'),
    },
  },
};

const modelledOnAnElement = new Set(Object.values(elements).flatMap((element) => Object.keys(element.derived ?? {})));

/**
 * Who is what to which element, who counts as what (the derived relations), and which permission
 * each one grants. A bounded context and who operates it is the example type: a use case on no
 * element names its context as the resource (`{ type: 'context', id: '<context>' }`), and the
 * operators of the context hold every permission no element derives. A system actor (a scheduled
 * job, an integration event handler) is a subject of type `system`.
 */
export const relationshipSchema = defineSchema({
  user: {},
  system: {},
  context: {
    relations: { operator: ['user', 'system'], eraser: ['system'] },
    derived: {
      ...Object.fromEntries(
        permissions
          .all()
          .filter((permission) => !modelledOnAnElement.has(permission.id))
          .map((permission) => [permission.id, 'operator']),
      ),
      'data-protection:data.erase': { anyOf: ['operator', 'eraser'] },
    },
  },
  ...elements,
});
