import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { InvalidAmount } from '@/contexts/credit-application/file/domain/errors/invalid-amount.error';
import { BrokerRegistrationLapsed } from '@/contexts/credit-application/file/domain/errors/broker-registration-lapsed.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { CustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/application/ports/customer-advisor-branch-gateway.port';
import type { BrokerRegistrations } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import type { BringApplicationCommand } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.command';

/**
 * A broker brings an application for a customer: it is submitted as the customer's own would be, and the file records the
 * broker who brought it, right after the submission. A broker whose registration lapsed brings nothing.
 */
export class BringApplicationHandler implements CommandHandler<BringApplicationCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly customerAdvisorBranch: CustomerAdvisorBranchGateway,
    private readonly brokerRegistrations: BrokerRegistrations,
  ) {}

  async execute(command: BringApplicationCommand): Promise<string> {
    const brokerId = command.actor.id;
    const { request } = command;

    await this.checkRegistrationInForce(brokerId);

    const broughtAt = this.clock.now();
    const branchId = (await this.customerAdvisorBranch.branchOfCustomerAdvisor(request.customerId)) ?? '';

    const creditApplication = CreditApplication.create(this.ids.next(), request.customerId, {
      amount: this.amountOf(request.amountInCents),
      durationMonths: request.durationMonths,
      registeredAt: broughtAt,
      branchId,
      productId: request.productId,
    });

    creditApplication.recordBrought(brokerId, broughtAt);
    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }

  /** The broker is refused when no registration of it is known, or when its last event said it lapsed. */
  private async checkRegistrationInForce(brokerId: string): Promise<void> {
    const registration = await this.brokerRegistrations.get(brokerId);

    if (!registration?.inForce) {
      throw BrokerRegistrationLapsed.forBroker(brokerId);
    }
  }

  /** A requested amount that is not whole cents is refused here, before Money would refuse it as a fault. */
  private amountOf(cents: number): Money {
    if (!Number.isSafeInteger(cents)) {
      throw InvalidAmount.forCents(cents);
    }

    return Money.ofCents(cents);
  }
}
