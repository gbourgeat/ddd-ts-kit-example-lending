import { PrismaContext } from '@ddd-ts-kit/prisma';
import type { Prisma } from '$generated/prisma/client';

/** The storage of the application, as a repository adapter types its constructor parameter by it: the transaction client of the current unit of work, or the root client. */
export abstract class Database extends PrismaContext<Prisma.TransactionClient> {}
