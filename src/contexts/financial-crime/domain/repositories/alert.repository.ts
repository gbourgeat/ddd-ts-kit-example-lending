import { Repository } from '@ddd-ts-kit/kernel';
import type { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';

export abstract class AlertRepository extends Repository<Alert> {}
