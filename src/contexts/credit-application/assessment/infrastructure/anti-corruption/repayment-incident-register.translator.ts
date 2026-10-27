export interface RepaymentIncidentRegisterRecord {
  // TODO(domain): declare the fields received from Repayment incident register, exactly as they arrive (its names, its formats).
}

export interface TranslatedRepaymentIncidentRegisterRecord {
  // TODO(domain): replace this type by the value object, command or read model of credit-application the record becomes; nothing of the vocabulary of Repayment incident register may appear in it.
}

export class RepaymentIncidentRegisterTranslator {
  translate(record: RepaymentIncidentRegisterRecord): TranslatedRepaymentIncidentRegisterRecord {
    // TODO(domain): map each field to the model of credit-application, convert units and codes, and throw when Repayment incident register sends something this model cannot express.
    return {};
  }
}
