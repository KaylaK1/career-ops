# Command audit — 2026-10-21

## Scope

Audited the 44 assistant-router entries (43 modes plus the inbox alias) and all 68 package.json scripts. Assistant modes are instruction-driven workflows; a static routing check and CLI smoke tests do not establish that every generated answer or external integration will work in every session. Live applications, external messages, production scans and system updates were not triggered by this audit.

## Fixes

- Markdown tracker queries preserve every source column and its order, including URL and custom columns. Bare tracker CLI invocation displays the table. JSON compatibility is retained; --json --all-columns exposes original source labels and values.
- Invalid query limits and impossible calendar dates now fail instead of returning an unintended listing.
- Router menu, argument hints, mode files and context policies now cover every route, including auto-pipeline and inbox. Expand, interview-redflag and update have context policies. Reply-watch and interview-redflag appear in the menu.
- Shared invocation/display rules require complete mode outputs, saved preferences, explicit missing inputs, correct npm-script variants, and honest partial/failure reporting.
- Help requests for OpenRouter subcommands, updater subcommands, PDF generation, keyword matching, story matching, application preparation, dashboard build and manifesto exit before work. The npm cover-letter --payload wrapper also recognizes --help correctly.
- Importing the PDF renderer no longer creates output/.
- Dashboard build checks the actual Go compiler and the minimum version from dashboard/go.mod, rather than invoking an unrelated executable named go. Help and script documentation now name the correct Go 1.26.0+ requirement. Supplemental fixture tests cover invalid, older and supported compiler versions.
- Tests cover complete tracker display, compatibility, route parity and help side effects. The main agent instruction table now includes onboarding/European SWE modes and routes manual tracker additions to tracker rather than the CV add mode.
- Node worker IPC decoding failures are retried once with the direct node:test autorunner in a separate OS process; retries are reported. Ordinary assertion failures are not retried. A control verifies that direct tests with top-level await complete and retain failing exit status. Existing doctor/apply fixtures now isolate CLI/data-root assumptions; Gemini encoding checks use offline context-only mode.

## Verification

- All 44 routing entries: mode file, menu, hint, exactly one context policy.
- All 68 npm scripts: local target/toolchain inventory checked.
- 61 supported npm help entrypoints: successful exit and useful help output in an isolated data root.
- 15 help-safety cases: no data files, keys or output writes required.
- Filtered full-column Markdown, full-column JSON, legacy JSON, invalid input and bare tracker invocation: passed.
- Full repository suite: 16,648 passed, 0 failed, 18 warnings; 790 discovered suites plus inline checks. Warnings remain visible rather than being treated as a clean warning-free run.
- Private career-data repository remained clean during the audit.

## Assistant command inventory

| Invocation | Mode file | Router checks |
|---|---|---|
| `auto-pipeline` | `modes/auto-pipeline.md` | Passed |
| `oferta` | `modes/oferta.md` | Passed |
| `ofertas` | `modes/ofertas.md` | Passed |
| `contacto` | `modes/contacto.md` | Passed |
| `deep` | `modes/deep.md` | Passed |
| `interview-prep` | `modes/interview-prep.md` | Passed |
| `interview` | `modes/interview.md` | Passed |
| `master-profile` | `modes/master-profile.md` | Passed |
| `intake` | `modes/intake.md` | Passed |
| `retro` | `modes/retro.md` | Passed |
| `eu-swe` | `modes/regional/eu-swe.md` | Passed |
| `interview/plan` | `modes/interview/plan.md` | Passed |
| `interview/practice` | `modes/interview/practice.md` | Passed |
| `interview/debrief` | `modes/interview/debrief.md` | Passed |
| `pdf` | `modes/pdf.md` | Passed |
| `ats` | `modes/ats.md` | Passed |
| `text` | `modes/text.md` | Passed |
| `latex` | `modes/latex.md` | Passed |
| `latex-tex` | `modes/latex-tex.md` | Passed |
| `email` | `modes/email.md` | Passed |
| `add` | `modes/add.md` | Passed |
| `expand` | `modes/expand.md` | Passed |
| `training` | `modes/training.md` | Passed |
| `project` | `modes/project.md` | Passed |
| `tracker` | `modes/tracker.md` | Passed |
| `agent-inbox` | `modes/agent-inbox.md` | Passed |
| `inbox` | `modes/agent-inbox.md` | Passed |
| `pipeline` | `modes/pipeline.md` | Passed |
| `apply` | `modes/apply.md` | Passed |
| `scan` | `modes/scan.md` | Passed |
| `discover` | `modes/discover.md` | Passed |
| `triage` | `modes/triage.md` | Passed |
| `batch` | `modes/batch.md` | Passed |
| `patterns` | `modes/patterns.md` | Passed |
| `calibrate` | `modes/calibrate.md` | Passed |
| `offer-prep` | `modes/offer-prep.md` | Passed |
| `titles` | `modes/titles.md` | Passed |
| `upskill` | `modes/upskill.md` | Passed |
| `followup` | `modes/followup.md` | Passed |
| `reply-watch` | `modes/reply-watch.md` | Passed |
| `outcome` | `modes/outcome.md` | Passed |
| `interview-redflag` | `modes/interview-redflag.md` | Passed |
| `update` | `modes/update.md` | Passed |
| `cover` | `modes/cover.md` | Passed |

## npm command inventory

Help checks confirm invocation/usage behavior only. The seven other entries are validation, lifecycle or toolchain commands rather than ordinary help-driven workflows. See the full suite completion record for broader functional coverage.

| npm script | Entrypoint | Audit coverage |
|---|---|---|
| `doctor` | `node doctor.mjs` | Help smoke passed |
| `ui` | `node scripts/ui-server.mjs` | Help smoke passed |
| `or` | `node openrouter-runner.mjs` | Help smoke passed |
| `or:scan` | `node openrouter-runner.mjs scan` | Help smoke passed |
| `or:pipeline` | `node openrouter-runner.mjs pipeline` | Help smoke passed |
| `or:eval` | `node openrouter-runner.mjs evaluate` | Help smoke passed |
| `or:apply` | `node openrouter-runner.mjs apply` | Help smoke passed |
| `verify` | `node verify-pipeline.mjs` | Target/toolchain reviewed; full-suite checks where applicable |
| `lint` | `node scripts/check-syntax.mjs` | Target/toolchain reviewed; full-suite checks where applicable |
| `normalize` | `node normalize-statuses.mjs` | Help smoke passed |
| `dedup` | `node dedup-tracker.mjs` | Help smoke passed |
| `fix-report-links` | `node fix-report-links.mjs` | Help smoke passed |
| `merge` | `node merge-tracker.mjs` | Help smoke passed |
| `reconcile` | `node reconcile-pipeline.mjs` | Help smoke passed |
| `pdf` | `node generate-pdf.mjs` | Help smoke passed |
| `jd:similarity` | `node jd-similarity.mjs` | Help smoke passed |
| `img-to-pdf` | `node img-to-pdf.mjs` | Help smoke passed |
| `cover-letter` | `node generate-cover-letter.mjs --payload` | Help smoke passed |
| `cv:verify-facts` | `node verify-cv-facts.mjs` | Help smoke passed |
| `cv:verify-ats` | `node verify-ats.mjs` | Help smoke passed |
| `test:cv-visual` | `playwright test --config=playwright.cv.config.mjs` | Target/toolchain reviewed; full-suite checks where applicable |
| `test:cv-visual:update` | `playwright test --config=playwright.cv.config.mjs --update-snapshots` | Target/toolchain reviewed; full-suite checks where applicable |
| `sync-check` | `node cv-sync-check.mjs` | Help smoke passed |
| `update:check` | `node update-system.mjs check` | Help smoke passed |
| `update:test` | `node updater-migration-tests.mjs` | Target/toolchain reviewed; full-suite checks where applicable |
| `update` | `node update-system.mjs apply --confirm` | Help smoke passed |
| `rollback` | `node update-system.mjs rollback` | Help smoke passed |
| `liveness` | `node check-liveness.mjs` | Help smoke passed |
| `extract` | `node browser-extract.mjs` | Help smoke passed |
| `scan:hn` | `node scan-hn.mjs` | Help smoke passed |
| `scan` | `node scan.mjs` | Help smoke passed |
| `scan:full` | `node scan-ats-full.mjs` | Help smoke passed |
| `scan:seeds` | `node scan-ats-full.mjs --seeds yc,a16z` | Help smoke passed |
| `scan:yc` | `node scan-ats-full.mjs --seeds yc` | Help smoke passed |
| `scan:interamt` | `node scan-interamt.mjs` | Help smoke passed |
| `scan:dayforce` | `node scan-dayforce.mjs` | Help smoke passed |
| `company:funded` | `node company-funded.mjs` | Help smoke passed |
| `validate:portals` | `node validate-portals.mjs` | Help smoke passed |
| `verify:portals` | `node verify-portals.mjs` | Help smoke passed |
| `tracker` | `node tracker.mjs` | Help smoke passed |
| `find` | `node find.mjs` | Help smoke passed |
| `patterns` | `node analyze-patterns.mjs` | Help smoke passed |
| `keyword-match` | `node keyword-match.mjs` | Help smoke passed |
| `calibrate` | `node calibrate.mjs` | Help smoke passed |
| `upskill` | `node upskill.mjs` | Help smoke passed |
| `career-profile` | `node career-profile.mjs` | Help smoke passed |
| `add` | `node add-entry.mjs` | Help smoke passed |
| `reposts` | `node detect-reposts.mjs` | Help smoke passed |
| `digest` | `node weekly-digest.mjs` | Help smoke passed |
| `freshness` | `node check-table-freshness.mjs` | Help smoke passed |
| `jd-archive` | `node check-jd-archive.mjs` | Help smoke passed |
| `rejection-latency` | `node rejection-latency.mjs` | Help smoke passed |
| `closing-soon` | `node closing-soon.mjs` | Help smoke passed |
| `invite-match` | `node invite-match.mjs` | Help smoke passed |
| `paste-reply` | `node paste-reply.mjs` | Help smoke passed |
| `gemini:eval` | `node gemini-eval.mjs` | Help smoke passed |
| `ollama:eval` | `node ollama-eval.mjs` | Help smoke passed |
| `openai:eval` | `node openai-eval.mjs` | Help smoke passed |
| `openai:tailor` | `node openai-tailor.mjs` | Help smoke passed |
| `eval:golden` | `node eval-golden.mjs` | Help smoke passed |
| `star` | `node match-star.mjs` | Help smoke passed |
| `archive` | `node archive-posting.mjs` | Help smoke passed |
| `prepare:application` | `node prepare-application.mjs` | Help smoke passed |
| `application:init` | `node application-artifacts.mjs --init` | Help smoke passed |
| `build:dashboard` | `node build-dashboard.mjs` | Help smoke passed |
| `serve:dashboard` | `cd dashboard && go run .` | Target/toolchain reviewed; full-suite checks where applicable |
| `postinstall` | `node -e "process.exit(['','0','false'].includes((process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD&#124;&#124;'').toLowerCase())?1:0)" &#124;&#124; npx playwright install chromium &#124;&#124; npx playwright install chromium` | Target/toolchain reviewed; full-suite checks where applicable |
| `manifesto` | `node manifesto.mjs` | Help smoke passed |

## Completion record

Final full suite completed successfully: 16,648 passed, 0 failed, 18 warnings. The 790 discovered suites ran in 447 seconds alongside inline checks. Two Node worker IPC decode failures were recovered with visible retry warnings; other warnings include the unavailable Go compiler, skipped live API/model checks, intentional portal handoffs, and upstream-author-name detections; their detail is retained in the log. All 61 supported help smoke checks passed, as did the targeted tracker/help/router checks. Current tracker output was checked against the actual saved ten-column schema and retained its job link. Logs are under /workspace/work/command-audit/. No career-data changes were performed during the audit. Source changes were validated locally before committing and pushing.

## Remaining environment-dependent validation

- A real Go dashboard build is unverified in this executor: /usr/bin/go is not the Go compiler. The CLI now diagnoses this explicitly; successful and rejected compiler paths were checked with fixtures. Install Go 1.26.0+ on PATH to build/serve the dashboard.
- Live Greenhouse archive rendering, OpenRouter apply generation, H1B live API and key-minting checks were skipped or unavailable; those paths need their services/credentials. No paid model calls, live submissions or production updates were used to certify these workflows.
- After the full suite, the supplemental dashboard prerequisite and tracker/help tests passed (9 node:test tests). The full suite was not repeated for the dashboard-only prerequisite diagnostic.
