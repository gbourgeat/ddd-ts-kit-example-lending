import { dddTsKit } from '@ddd-ts-kit/eslint-plugin';

// The Prisma client under generated/ is a build product: it is not linted.
export default dddTsKit({ tsconfigRootDir: import.meta.dirname, ignores: ['generated/**'] });
