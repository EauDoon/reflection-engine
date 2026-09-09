# Offline companion reference

Run `node reflection.mjs --help` to see the commands. Arguments are positional; unknown commands, extra arguments, invalid inputs, and existing output files exit with code 1. Success exits with code 0. Errors do not echo source text. No command sends a network request or invokes a model. Keep files in an existing private folder outside this repository.

```sh
node reflection.mjs validate-corpus corpus.json
node reflection.mjs build corpus.json new-packet.md [config.json]
node reflection.mjs redact corpus.json rules.json new-corpus.json
node reflection.mjs receipt packet.md new-receipt.json
node reflection.mjs verify-receipt receipt.json packet.md
node reflection.mjs validate-report report.json corpus.json [config.json]
node reflection.mjs compare before-run.json after-run.json new-comparison.md
node reflection.mjs import-text chosen.txt metadata.json new-corpus.json
node reflection.mjs merge new-corpus.json first.json second.json [more-corpora.json]
node reflection.mjs select corpus.json selection.json new-corpus.json
node reflection.mjs inspect corpus.json new-inspection.json
node reflection.mjs preview corpus.json new-preview.json [config.json]
node reflection.mjs draft-report corpus.json new-report.json [config.json]
```

Square brackets indicate an optional argument; do not type them. Use the same configuration for building and report validation. The default is quick mode, all supplied domains, no date limit, Markdown output. To request machine validation, set `format` to `json` before building. Save the assistant's JSON response in a new local file, then validate it. A rejected report should be corrected against the original sources, not fixed by raising confidence or adding invented evidence.

Limits: JSON inputs at most 1 MiB and 128 nested containers, 200 sources, 20000 characters per source; receipt inputs at most 8 MiB. JSON files must contain valid UTF-8 and unique keys in every object, including names written using Unicode escapes. Duplicate fields are rejected before configuration or filtering, so an ambiguous domain or exclusion cannot silently take the last value. An optional UTF-8 BOM is accepted. Invalid bytes are rejected instead of being replaced in the evidence. A large corpus may exceed a provider's context window despite passing local checks. Build a narrower run when necessary. Comparison bundles repeat corpus and report data and share the 1 MiB limit. Split a large run into smaller selected corpora rather than bypassing the bounds.

JSON and receipt packet inputs are opened once and checked as regular files using that descriptor. Reads stop at the respective 1 MiB or 8 MiB limit plus one overflow-detection byte, even if the file grows after its size check. POSIX opens are nonblocking so a FIFO cannot wait indefinitely for a writer. The descriptor closes on success and failure. This bounds ingestion; it does not make a concurrently edited file an immutable snapshot.

## Synthetic end-to-end validation

`npm test` runs the standard-library tests and real CLI processes in temporary local directories, including paths with spaces and execution outside the repository. It exercises packet building, filters, JSON format, redaction, report validation, receipts, comparison, invalid input, no-overwrite behavior, and size limits. It never contacts an assistant. `npm run check` checks the CLI syntax. No install is needed because there are no dependencies.

CI runs these checks on Windows and Linux with Node 22 and 24. CI configuration is not proof that an unrun remote check passed. Model output quality, provider privacy, and actual human outcomes are outside this automated test suite.
