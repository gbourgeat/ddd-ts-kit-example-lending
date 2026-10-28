import { definePermissions } from '@ddd-ts-kit/auth';

export const servicingPermissions = definePermissions('servicing', {
  // ddd-ts-kit:permissions
  'loan.erase-past-retention': { description: 'Erase personal data past retention' },
  'loan.close': { description: 'Close loan' },
  'loan.record-payout': { description: 'Record payout' },
  'loan.read': { description: 'Read loan' },
  'loan.compute-due': { description: 'Compute due instalments' },
  'loan.repay-early': { description: 'Repay early' },
  'loan.write-off': { description: 'Write off loan' },
  'loan.reschedule': { description: 'Reschedule loan' },
  'loan.record-repayment': { description: 'Record withdrawal repayment' },
  'loan.collect': { description: 'Collect instalment' },
  'loan.classify-arrears': { description: 'Classify arrears' },
  'loan.declare-default': { description: 'Declare default' },
  // /ddd-ts-kit:permissions
});
