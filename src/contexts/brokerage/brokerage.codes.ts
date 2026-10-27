export const BrokerageCodes = {
  InvalidBrokerRegistration: 'INVALID_BROKER_REGISTRATION',
} as const;

export type BrokerageCode = (typeof BrokerageCodes)[keyof typeof BrokerageCodes];
