import { describe, expect, it } from '@jest/globals';
import { createPlatform } from '@/platform/composition/create-platform';
import { inertPersistence } from '@/platform/database/inert-persistence';
import { inProcessEvents } from '@/platform/events/in-process-events';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { identityModule } from '@/contexts/identity/identity.module';
import { dataProtectionModule } from '@/contexts/data-protection/data-protection.module';
import { creditPolicyModule } from '@/contexts/credit-policy/credit-policy.module';
import { creditScoringModule } from '@/contexts/credit-scoring/credit-scoring.module';
import { brokerageModule } from '@/contexts/brokerage/brokerage.module';
import { customerDueDiligenceModule } from '@/contexts/customer-due-diligence/customer-due-diligence.module';
import { branchNetworkModule } from '@/contexts/branch-network/branch-network.module';
import { creditApplicationModule } from '@/contexts/credit-application/credit-application.module';
import { servicingModule } from '@/contexts/servicing/servicing.module';
import { financialCrimeModule } from '@/contexts/financial-crime/financial-crime.module';
import { reportingModule } from '@/contexts/reporting/reporting.module';
// /ddd-ts-kit:imports

const contexts: readonly (readonly [string, (platform: Platform) => { readonly name: string }])[] = [
  // ddd-ts-kit:contexts
  ['identity', identityModule],
  ['data-protection', dataProtectionModule],
  ['credit-policy', creditPolicyModule],
  ['credit-scoring', creditScoringModule],
  ['brokerage', brokerageModule],
  ['customer-due-diligence', customerDueDiligenceModule],
  ['branch-network', branchNetworkModule],
  ['credit-application', creditApplicationModule],
  ['servicing', servicingModule],
  ['financial-crime', financialCrimeModule],
  ['reporting', reportingModule],
  // /ddd-ts-kit:contexts
];

describe('A bounded context is a deployable unit in waiting', () => {
  it('the platform wires alone, before the first context joins it', () => {
    expect(() => createPlatform(inertPersistence(), { events: inProcessEvents() })).not.toThrow();
  });

  // Jest refuses a table without rows: until the first context joins the project, its cases wait, as a passing case that says so (a pending entry would stay in the list of what is left for ever).
  if (contexts.length === 0) {
    it('has no context to wire alone yet', () => expect(contexts).toHaveLength(0));
  } else {
    it.each(contexts)('%s wires alone, on the platform, with no other context', (name, module) => {
      const platform = createPlatform(inertPersistence(), { events: inProcessEvents() });

      expect(module(platform).name).toBe(name);
    });

    it.each(contexts)('%s takes its scheduled jobs with it, and no job of another context', (name, module) => {
      const platform = createPlatform(inertPersistence(), { events: inProcessEvents() });

      module(platform);

      expect(platform.jobs.describe().filter((job) => !job.name.startsWith(name + '.'))).toEqual([]);
    });
  }
});
