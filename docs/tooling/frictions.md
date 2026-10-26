# Frictions with ddd-ts-kit

One row per thing of the kit that was wrong or in the way while building this project: a generated
file, a command, a skill, a rule. The kit issue it became, when one was filed.

| Date | Step | What happened | Command and output | Workaround | Kit issue |
|---|---|---|---|---|---|
| 2026-10-27 | 5 init | `init` wrote 143 of its 166 files, then stopped at the hook scripts: `.claude/hooks` is masked in this sandbox (a character device, `/dev/null`), so the kit cannot create its directory. The `--dry-run` passed, since it writes nothing. `.claude/settings.json` is masked too and was skipped. The 23 files after the hooks (OpenAPI, clients, `docs/context-map.md`, `docs/privacy/register.md`, behaviour and integration docs) are not written; a rerun stops at the same path | `npx -y ddd-ts-kit@0.94.1 init <imposed flags> --json` → `Error: EEXIST: file already exists, mkdir '/home/gbourgeat/lending/.claude/hooks'` | none: the hooks cannot be written here, and no flag leaves them out. Not hand-written | not filed |
| 2026-10-27 | 5 npm install | `@ddd-ts-kit/kernel@0.94.1` is listed in the registry (published 2026-10-26 23:07:31 UTC), but its tarball returns 404; the other sixteen kit packages at 0.94.1 download. First run: `ETARGET`, second: `E404` | `npm install` → `npm error 404 Not Found - GET https://registry.npmjs.org/@ddd-ts-kit/kernel/-/kernel-0.94.1.tgz`; `curl` on the same URL → 404 on three attempts over three minutes | none: not `0.94.0` nor `@latest` (owner brief). Waiting for the release to be whole | not filed |
