import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';
import { OrganisationName } from '@/contexts/identity/domain/value-objects/organisation-name.vo';
import { OrganisationSlug } from '@/contexts/identity/domain/value-objects/organisation-slug.vo';

interface OrganisationIngredients {
  readonly slug: string;
  readonly name: string;
  readonly openedBy: string;
  readonly openedAt: Date;
}

export class OrganisationBuilder extends Builder<OrganisationIngredients, Organisation> {
  identifiedBy(slug: string): this {
    return this.with('slug', slug);
  }

  named(name: string): this {
    return this.with('name', name);
  }

  openedBy(accountId: string): this {
    return this.with('openedBy', accountId);
  }

  protected defaults(): Defaults<OrganisationIngredients> {
    return {
      slug: sequence('acme'),
      name: 'Acme',
      openedBy: 'account-founder',
      openedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  protected construct(ingredients: OrganisationIngredients): Organisation {
    const terms = { name: OrganisationName.create(ingredients.name), openedBy: ingredients.openedBy };

    return Organisation.open(OrganisationSlug.create(ingredients.slug), terms, ingredients.openedAt);
  }
}

export function anOrganisation(): OrganisationBuilder {
  return new OrganisationBuilder();
}
