import { definePermissions } from '@ddd-ts-kit/auth';

export const creditApplicationPermissions = definePermissions('credit-application', {
  // ddd-ts-kit:permissions
  'application.submit': { description: 'Submit application' },
  'application.consent': { description: 'Give account consent' },
  'application.read': { description: 'List applications' },
  'application.name-party': { description: 'Name co borrower' },
  'application.correct': { description: 'Correct entry' },
  'application.decide': { description: 'Decide an application: read its declared conflicts first' },
  'application.attach-document': { description: 'Attach document' },
  'application.read-accounts': { description: 'Read account information' },
  'application.consult-register': { description: 'Consult repayment incident register' },
  'application.erase-past-retention': { description: 'Erase personal data past retention' },
  'delegation-table.keep': { description: 'Keep delegation table' },
  'decider-level.keep': { description: 'Keep decider level' },
  'rate-grid.keep': { description: 'Keep rate grid' },
  'legal-maximum-rate.keep': { description: 'Keep legal maximum rate' },
  'application.assess': { description: 'Assess application' },
  'product-terms.keep': { description: 'Keep product terms' },
  'broker-registration.keep': { description: 'Keep broker registration' },
  'application.review-refusal': { description: 'Review proposed refusal' },
  'application.bring': { description: 'Bring application' },
  'offer.draft': { description: 'Draft offer' },
  'offer.read-sheet': { description: 'Read pre contractual sheet' },
  // /ddd-ts-kit:permissions
});
