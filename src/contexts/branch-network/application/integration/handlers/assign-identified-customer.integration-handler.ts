import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  customerAdvisorAssignedV1,
  type CustomerAdvisorAssignedV1,
} from '@/contexts/customer-due-diligence/published-language';
import { AssignCustomerCommand } from '@/contexts/branch-network/application/commands/assign-customer/assign-customer.command';

/**
 * When customer-due-diligence gives a customer its advisor, the customer joins the advisor's portfolio. Delivery is
 * at least once: the membership is a relation, so a repeated delivery leaves the same portfolio.
 */
export class AssignIdentifiedCustomerIntegrationHandler {
  static readonly eventType = customerAdvisorAssignedV1.type;

  readonly actor = systemActor('branch-network.assign-identified-customer');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: CustomerAdvisorAssignedV1): Promise<void> {
    await this.commands.execute(
      new AssignCustomerCommand(this.actor, event.payload.advisorId, event.payload.customerId),
    );
  }
}
