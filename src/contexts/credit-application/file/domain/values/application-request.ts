import type { Money } from '@/shared-kernel/money.vo';

/** What the applicant asks for, and the instant the application is registered. */
export interface ApplicationRequest {
  readonly amount: Money;
  readonly durationMonths: number;
  readonly registeredAt: Date;
  readonly branchId: string;
  readonly productId?: string;
}
