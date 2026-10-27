export interface AccountInformationProviderRecord {
  // TODO(domain): declare the fields received from Account information provider, exactly as they arrive (its names, its formats).
}

export interface TranslatedAccountInformationProviderRecord {
  // TODO(domain): replace this type by the value object, command or read model of credit-application the record becomes; nothing of the vocabulary of Account information provider may appear in it.
}

export class AccountInformationProviderTranslator {
  translate(record: AccountInformationProviderRecord): TranslatedAccountInformationProviderRecord {
    // TODO(domain): map each field to the model of credit-application, convert units and codes, and throw when Account information provider sends something this model cannot express.
    return {};
  }
}
