import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { AcceptOfferCommand } from '@/contexts/credit-application/offer/application/commands/accept-offer/accept-offer.command';
import type { ElectronicSignature } from '@/contexts/credit-application/offer/application/ports/electronic-signature.port';
import { UnknownOffer } from '@/contexts/credit-application/offer/domain/errors/unknown-offer.error';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';

/**
 * Records the borrower's electronic signature of an issued offer, on the day of the command: the offer is signed through the
 * electronic signature port, and its signing date is kept, from which the withdrawal and the payout count.
 */
export class AcceptOfferHandler implements CommandHandler<AcceptOfferCommand> {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly dependencies: {
      readonly signature: ElectronicSignature;
      readonly clock: Clock;
    },
  ) {}

  async execute(command: AcceptOfferCommand): Promise<void> {
    const { signature, clock } = this.dependencies;
    const offer = await this.offerRepository.findById(command.offerId);

    if (offer === undefined) {
      throw UnknownOffer.forOffer(command.offerId);
    }

    offer.accept(clock.now());

    await signature.requestSignature(offer.id, command.actor.id);
    await this.offerRepository.save(offer);
  }
}
