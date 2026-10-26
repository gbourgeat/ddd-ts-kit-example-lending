import { requires, type UseCaseDeclaration } from '@ddd-ts-kit/auth';
import { controllerRoutes, type Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
import { auditPermissions } from '@/platform/audit/audit.permissions';
import { SearchAuditEntriesHandler } from '@/platform/audit/search-audit-entries/search-audit-entries.handler';
import { SearchAuditEntriesQuery } from '@/platform/audit/search-audit-entries/search-audit-entries.query';
import { SearchAuditEntriesController } from '@/platform/audit/search-audit-entries/search-audit-entries.controller';
import { securitySchemes } from '@/platform/auth/authentication/security-schemes';

interface AuditWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
}

/**
 * The read side of the audit trail: a capability of the platform, not a bounded context. It has
 * no model of its own, only one protected query over the `AuditReader` port, registered like any
 * use case so that reading the trail is authorized and recorded.
 */
export function auditModule(platform: Platform): AuditWiring {
  platform.queries.register(SearchAuditEntriesQuery, new SearchAuditEntriesHandler(platform.audit.reader), {
    context: 'audit',
  });

  return {
    name: 'audit',
    useCases: [
      requires(SearchAuditEntriesQuery, auditPermissions['trail.read'], {
        resource: () => ({ type: 'context', id: 'audit' }),
      }),
    ],
    routes: controllerRoutes([new SearchAuditEntriesController(platform.queries)], {
      security: Object.keys(securitySchemes),
    }),
  };
}
