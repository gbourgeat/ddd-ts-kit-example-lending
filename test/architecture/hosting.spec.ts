import { readFileSync } from 'node:fs';
import { describe, expect, it } from '@jest/globals';
import { offlineAuthenticator } from '@/platform/auth/authentication/offline-authenticator';
import { composeApplication, everyContext, hostedContexts } from '@/platform/composition/compose-application';
import { inertPersistence } from '@/platform/database/inert-persistence';
import { inProcessEvents } from '@/platform/events/in-process-events';

/** The contexts run as services of their own: `ddd-ts-kit generate service` adds one. */
const extracted: readonly string[] = [
  // ddd-ts-kit:extracted
  'servicing',
  // /ddd-ts-kit:extracted
];

type ContextModule = (typeof everyContext)[number];

/** The modules `hostedContexts` leaves out. */
const services = everyContext.filter((module) => !hostedContexts.includes(module));

/** The jobs of the platform are named after its capabilities, and run in the whole application only. */
const PLATFORM = ['audit', 'privacy', 'files'];

const options = {
  events: inProcessEvents(),
  authenticator: offlineAuthenticator,
};

describe('A context run as a service leaves the whole application', () => {
  // Jest refuses a table without rows: until a context becomes a service, its cases wait.
  if (extracted.length === 0) {
    it.todo('hosts no job of a context run as a service, once the project has one');
  } else {
    it.each(extracted)('%s: the whole application schedules none of its jobs', (name) => {
      const whole = composeApplication(inertPersistence(), options, hostedContexts).platform.jobs.describe();

      expect(whole.filter((job) => job.name.startsWith(name + '.'))).toEqual([]);
    });

    it.each(services.map((module, index): [number, ContextModule] => [index + 1, module]))(
      'extracted context %s: its service schedules the jobs of one context, and none of the platform',
      (_position, module) => {
        const application = composeApplication(inertPersistence(), { ...options, platformJobs: false }, [module]);
        const owners = application.platform.jobs.describe().map((job) => job.name.split('.')[0]);

        expect(new Set(owners).size).toBeLessThanOrEqual(1);
        expect(owners.filter((owner) => PLATFORM.includes(owner ?? ''))).toEqual([]);
      },
    );

    it.each(extracted)('%s: its entry point leaves the jobs of the platform to the whole application', (name) => {
      expect(readFileSync('src/apps/' + name + '/main.ts', 'utf8')).toContain('platformJobs: false');
    });
  }
});
