# Event catalog

Generated from the integration event declarations. Do not edit by hand: regenerate.

## branch-network

### branch-network.conflict-of-interest.declared

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `branch-network.conflict-of-interest.declared` | 1 | A member of staff declared a link with a customer: they never prepare nor decide that customer's applications. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `conflictOfInterestId` | string | yes |  |
| `staffMemberId` | string | yes |  |
| `customerId` | string | yes |  |

### branch-network.staff-member.appointed

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `branch-network.staff-member.appointed` | 1 | A member of staff of a bank has been appointed. | no |
| `branch-network.staff-member.appointed` | 2 | A member of staff was appointed to a branch, with the level of the appointment. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `staffMemberId` | string | yes |  |

#### Payload of version 2

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `staffMemberId` | string | yes |  |
| `branchId` | string | yes |  |
| `level` | string | yes |  |

## brokerage

### brokerage.broker.registered

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `brokerage.broker.registered` | 1 | A broker is registered with the bank and may bring applications. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `brokerId` | string | yes |  |

### brokerage.broker.registration-lapsed

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `brokerage.broker.registration-lapsed` | 1 | The registration of a broker lapsed: the broker may no longer bring applications until registered again. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `brokerId` | string | yes |  |

## credit-application

### credit-application.credit-application.submitted

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `credit-application.credit-application.submitted` | 1 | A borrower or a broker has submitted a loan request: the application file is open, with its applicant, amount in cents and duration in months. | no |
| `credit-application.credit-application.submitted` | 2 | A credit application was submitted, for an amount and a duration, on a branch. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `creditApplicationId` | string | yes |  |
| `applicantId` | string | yes |  |
| `requestedAmountCents` | integer | yes |  |
| `durationMonths` | integer | yes |  |

#### Payload of version 2

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `creditApplicationId` | string | yes |  |
| `applicantId` | string | yes |  |
| `requestedAmountCents` | integer | yes |  |
| `durationMonths` | integer | yes |  |
| `branchId` | string | yes |  |

## credit-policy

### credit-policy.delegation-table.published

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `credit-policy.delegation-table.published` | 1 | A delegation table of the bank has been published, by its identifier. | no |
| `credit-policy.delegation-table.published` | 2 | A delegation table took effect: the amount each level of decider may approve, from its date of effect. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `delegationTableId` | string | yes |  |

#### Payload of version 2

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `delegationTableId` | string | yes |  |
| `effectiveFrom` | string (date) \| string (date-time) | yes |  |
| `levels[]` | array of object | yes |  |
| `levels[].level` | string | yes |  |
| `levels[].amountCents` | integer | yes |  |

### credit-policy.legal-maximum-rate.published

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `credit-policy.legal-maximum-rate.published` | 1 | A legal maximum rate of a category of loan has been published, by its identifier, from its date of effect. | no |
| `credit-policy.legal-maximum-rate.published` | 2 | A legal maximum rate of a category took effect: its rate in basis points, from its date of effect. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `legalMaximumRateId` | string | yes |  |

#### Payload of version 2

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `legalMaximumRateId` | string | yes |  |
| `category` | string | yes |  |
| `rateBasisPoints` | integer | yes |  |
| `effectiveFrom` | string (date) \| string (date-time) | yes |  |

### credit-policy.product.defined

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `credit-policy.product.defined` | 1 | A product of the bank catalogue has been defined; the other contexts read its terms from credit-policy by its identifier. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `productId` | string | yes |  |

### credit-policy.rate-grid.published

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `credit-policy.rate-grid.published` | 1 | A rate grid of a product has been published, by its identifier. | no |
| `credit-policy.rate-grid.published` | 2 | A rate grid of a product took effect, from its date of effect. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `rateGridId` | string | yes |  |

#### Payload of version 2

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `rateGridId` | string | yes |  |
| `productId` | string | yes |  |
| `effectiveFrom` | string (date) \| string (date-time) | yes |  |

### credit-policy.residual-income-minimum.published

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `credit-policy.residual-income-minimum.published` | 1 | A residual income minimum of the bank has been published, by its identifier. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `residualIncomeMinimumId` | string | yes |  |

## customer-due-diligence

### customer-due-diligence.customer.advisor-assigned

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `customer-due-diligence.customer.advisor-assigned` | 1 | A customer was given its advisor of the branch network, who looks after it. | no |

Consumers: `branch-network`

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `customerId` | string | yes |  |
| `advisorId` | string | yes |  |

### customer-due-diligence.customer.identified

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `customer-due-diligence.customer.identified` | 1 | A customer, a person or a business, has been identified before any credit. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `customerId` | string | yes |  |

## identity

### identity.account.deactivated

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `identity.account.deactivated` | 1 | An account was deactivated: its person signs in no more, and every context stops acting for it. | no |

Consumers: `identity`

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `accountId` | string | yes |  |

### identity.delegation.granted

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `identity.delegation.granted` | 1 | A member lent rights to another member of the organisation, from an instant to another. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `delegationId` | string | yes |  |
| `organisationId` | string | yes |  |
| `delegatorId` | string | yes |  |
| `delegateId` | string | yes |  |
| `rights[]` | array of string | yes |  |
| `startsAt` | string (date) \| string (date-time) | yes |  |
| `endsAt` | string (date) \| string (date-time) | yes |  |

### identity.delegation.revoked

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `identity.delegation.revoked` | 1 | A delegation ended before its period: what it lent, the delegate holds no more. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `delegationId` | string | yes |  |
| `organisationId` | string | yes |  |
| `delegatorId` | string | yes |  |
| `delegateId` | string | yes |  |

### identity.member.joined

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `identity.member.joined` | 1 | An account became a member of an organisation, in a role. | no |

Consumers: `identity`

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `memberId` | string | yes |  |
| `organisationId` | string | yes |  |
| `accountId` | string | yes |  |
| `role` | string | yes |  |

### identity.member.removed

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `identity.member.removed` | 1 | A member left an organisation: what they reached there through it, they reach no more. | no |

Consumers: `identity`

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `memberId` | string | yes |  |
| `organisationId` | string | yes |  |
| `accountId` | string | yes |  |
| `delegationId` | string | no |  |

### identity.member.role-changed

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `identity.member.role-changed` | 1 | The role of a member of an organisation changed. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `memberId` | string | yes |  |
| `organisationId` | string | yes |  |
| `accountId` | string | yes |  |
| `from` | string | yes |  |
| `to` | string | yes |  |
| `delegationId` | string | no |  |

### identity.organisation.opened

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `identity.organisation.opened` | 1 | An organisation was opened; with tenants, it is a new tenant. | no |

Consumers: `identity`

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `organisationId` | string | yes |  |
| `name` | string | yes |  |
| `openedBy` | string | yes |  |

## privacy

### privacy.data-subject.erased

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `privacy.data-subject.erased` | 1 | Every copy the platform reaches of a data subject is erased: erase yours. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `subjectId` | string | yes | The opaque identifier of the data subject. |
| `erasedAt` | string (date-time) | yes | When the platform erased its copies. |
