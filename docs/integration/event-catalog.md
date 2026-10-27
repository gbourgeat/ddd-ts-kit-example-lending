# Event catalog

Generated from the integration event declarations. Do not edit by hand: regenerate.

## credit-application

### credit-application.credit-application.submitted

| Type | Version | Description | Deprecated |
| --- | --- | --- | --- |
| `credit-application.credit-application.submitted` | 1 | A borrower or a broker has submitted a loan request: the application file is open, with its applicant, amount in cents and duration in months. | no |

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `creditApplicationId` | string | yes |  |
| `applicantId` | string | yes |  |
| `requestedAmountCents` | integer | yes |  |
| `durationMonths` | integer | yes |  |

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
