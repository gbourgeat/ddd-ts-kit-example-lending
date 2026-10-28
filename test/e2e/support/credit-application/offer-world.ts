import type { RunningApplication } from '$test/e2e/support/start-application';

const keepRateGridSystemActor = 'system:system:credit-application.keep-rate-grid';
const keepLegalMaximumRateSystemActor = 'system:system:credit-application.keep-legal-maximum-rate';

/** Gives back the lines of the system actors that keep the rate grids and the legal maximum rates, emptied by the reset. */
export async function keepOfferReads(application: RunningApplication): Promise<void> {
  for (const subject of [keepRateGridSystemActor, keepLegalMaximumRateSystemActor]) {
    await application.relate({ object: 'context:credit-application', relation: 'keeper', subject });
  }
}
