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

#### Payload of version 1

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `staffMemberId` | string | yes |  |

## customer-due-diligence

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
