# Reflection Engine

A prompt for candid, evidence-grounded reflection, with an optional offline companion for preparing exactly what you choose to share. This fork preserves Kevin Rose's [original v1.3 prompt](Reflection-Engine-v1.3.md) and adds a bounded edition with source IDs, uncertainty, selected questions, and explicit exclusions.

## Start without installing anything

1. Open [Reflection-Engine-Bounded.md](Reflection-Engine-Bounded.md) and use GitHub's **Download raw file** button.
2. Read it, then attach or paste it into your chosen assistant together with a few source episodes you explicitly choose. Label each with a source ID, episode ID, date (or unknown), and domain. See [corpus preparation](docs/corpus.md).
3. Send: `Use the bounded edition with only the source episodes I supplied here. Answer the default three questions. If the evidence is insufficient, say so. Do not access other history, memory, accounts, or files.`
4. Review source references and alternative explanations. Correct or reject interpretations that do not fit. Try at most one optional action before expanding the run.

The bounded download contains its three default questions and works alone. Assistant access varies; a prompt cannot make unavailable history visible. A larger model or higher reasoning setting does not guarantee a truthful portrait. You do not need to enable account history or memory for this workflow.

## Prepare a packet locally

Requires Node.js 22 or later. Download or clone this repository. No packages, accounts, API keys, install step, or model calls are needed. Run from the repository directory, using a private output folder that already exists:

```sh
node reflection.mjs validate-corpus examples/synthetic-corpus.json
node reflection.mjs build examples/synthetic-corpus.json /path/to/private/new-packet.md
```

On Windows, replace the output with a quoted absolute path, for example `"C:\your-private-folder\new-packet.md"`. Output files must not exist; the companion never overwrites them. Paths containing spaces must be quoted. The example corpus is entirely fictional. For your own run, copy the [empty corpus](templates/corpus.json) outside the repository and follow [the input contract](docs/corpus.md).

The packet contains the bounded instructions, selected upstream question headings, and filtered source text. Read the entire packet before choosing whether to upload it. The companion does not analyze you or generate a portrait. It helps prepare and check files for a model you choose separately.

| Workflow | Command or guide |
| --- | --- |
| Import explicitly chosen text files | [Source preparation](docs/source-preparation.md) |
| Quick, full, custom question IDs, dates and domains | [Configuration](docs/configuration.md) |
| Literal replacement before sharing | [Redaction](docs/redaction.md) |
| JSON output and evidence-reference checks | [Report contract](docs/report-contract.md) |
| Draft and review a report locally | [Review workflow](docs/review-workflow.md) |
| Verify the exact packet you reviewed | [Integrity receipts](docs/receipts.md) |
| Compare runs and review one experiment | [Follow-up](docs/follow-up.md) |
| Full local smoke test and command reference | [Offline companion](docs/offline.md) |

## Boundaries and privacy

The repository has no service or telemetry. The companion uses local files and the Node standard library, with no network calls. Uploading a packet separately shares its contents with your chosen provider under that provider's settings and policies. A prompt cannot enforce provider retention, prevent model errors, or guarantee that instructions embedded in source text are ignored.

Packets and portraits can be sensitive. Keep personal sources, reports, receipts, and redaction maps outside this public repository. Literal redaction does not guarantee anonymity. Validation checks file structure and reference consistency, not the truth of a psychological interpretation. Reflection Engine is not therapy, diagnosis, or a validated assessment.

## Original edition and attribution

The original [Reflection-Engine-v1.3.md](Reflection-Engine-v1.3.md) remains unchanged for users who want its full 22-question workflow. Its broad-corpus instructions differ from the bounded edition. Choose one workflow explicitly; do not attach both as competing instruction files. The offline builder draws question headings from the original and applies the bounded answer contract.

Original prompt by Kevin Rose, [upstream repository](https://github.com/kropdx/reflection-engine), [X](https://x.com/kevinrose), [Instagram](https://instagram.com/kevinrose). Fork additions provide local preparation and review workflows. See [LICENSE](LICENSE) for authorship and permission notices.
