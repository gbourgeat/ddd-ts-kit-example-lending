# Shared kernel

## Purpose

The value objects that the bounded contexts share because they hold the same kind of value. It holds no business rule of a context: a rule that belongs to one context stays in it.

## Ubiquitous language

| Term | Meaning | Not to be confused with |
|---|---|---|
| Money | An amount of euros held in whole cents, so that no fraction is ever kept | Price, which a context may compute from a Money |
| Cents | The whole number of cents of a Money | Euros, which the response of a route shows beside the cents |
