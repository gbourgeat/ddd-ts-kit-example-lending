import { authEnvironment } from '$test/e2e/support/auth-environment';

/** Without KAFKA_BROKERS (`npm run infra:up` gives one) the events stay in the process: the same ports, no broker. */
export const noBroker = 'in-process:0';

/** Without REDIS_URL (`npm run infra:up` gives one) what lives on the Redis protocol server stays in the memory of the process: the same ports, no server. */
export const noRedis = 'redis://in-process/tests';

type Variables = Readonly<Record<string, string | undefined>>;

/** The environment of an application under test: a free port, the settings of the test credentials, and what stands for an absent server. */
export function testEnvironment(overrides: Variables = {}): Variables {
  return {
    ...process.env,
    ...authEnvironment,
    NODE_ENV: 'test',
    PORT: '0',
    KAFKA_BROKERS: (process.env['KAFKA_BROKERS'] ?? '') || noBroker,
    REDIS_URL: (process.env['REDIS_URL'] ?? '') || noRedis,
    RATE_LIMIT_MAX: process.env['RATE_LIMIT_MAX'] ?? '1000000',
    ...overrides,
  };
}
