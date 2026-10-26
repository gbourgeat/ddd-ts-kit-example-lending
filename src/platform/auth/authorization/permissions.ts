import { PermissionRegistry } from '@ddd-ts-kit/auth';
import { auditPermissions } from '@/platform/audit/audit.permissions';
// ddd-ts-kit:imports
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';
import { creditScoringPermissions } from '@/contexts/credit-scoring/credit-scoring.permissions';
import { brokeragePermissions } from '@/contexts/brokerage/brokerage.permissions';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';
// /ddd-ts-kit:imports

/** Every permission of every context, and the one of the audit trail: the authorization model is laid out over it. */
export const permissions = PermissionRegistry.of(
  auditPermissions,
  // ddd-ts-kit:permission-sets
  identityPermissions,
  dataProtectionPermissions,
  creditPolicyPermissions,
  creditScoringPermissions,
  brokeragePermissions,
  customerDueDiligencePermissions,
  branchNetworkPermissions,
  creditApplicationPermissions,
  servicingPermissions,
  financialCrimePermissions,
  reportingPermissions,
  // /ddd-ts-kit:permission-sets
);
