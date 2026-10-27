export interface PaymentProviderRecord {
  // TODO(domain): declare the fields received from Payment provider, exactly as they arrive (its names, its formats).
}

export interface TranslatedPaymentProviderRecord {
  // TODO(domain): replace this type by the value object, command or read model of servicing the record becomes; nothing of the vocabulary of Payment provider may appear in it.
}

export class PaymentProviderTranslator {
  translate(record: PaymentProviderRecord): TranslatedPaymentProviderRecord {
    // TODO(domain): map each field to the model of servicing, convert units and codes, and throw when Payment provider sends something this model cannot express.
    return {};
  }
}
