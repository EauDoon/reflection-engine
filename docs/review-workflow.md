# Review a reflection locally

Use the same chosen corpus and configuration throughout a run. These tools check structure and preserve your decisions; they do not assess your personality or verify a model's conclusions. Keep all outputs private.

## Start with an honest draft

`node reflection.mjs draft-report corpus.json draft.json config.json` creates a report with the selected source IDs and questions. Each answer starts as insufficient evidence, confidence 1, no conclusion and no cited evidence. It passes the structural report validator without pretending that an analysis happened. Omit config.json for the default questions.

You may use the file as an editing aid or as a shape reference for a separately obtained model response. Do not accept its empty fields as completed analysis or manufacture support to fill them. Its non-action text asks you to review the evidence first. Validate a completed response with `validate-report` and the original configuration. Structural validity never replaces reviewing the actual evidence, alternative explanations and uncertainty.

## Save the reviewed run inputs together

`node reflection.mjs pack-run corpus.json report.json run.json config.json` validates the report against the chosen configuration and creates the existing comparison-run structure. It stores the selected corpus, configuration and report together. Excluded source records and their text are omitted. This does not prove that a provider used only those sources; it records the local inputs you supply.

The snapshot works directly with `node reflection.mjs compare before-run.json after-run.json comparison.md`. Its combined serialized size must fit 1 MiB; narrow the corpus if necessary. The run still contains selected source text and potentially sensitive report claims. Keep it private. The file is a snapshot of data, not a signed model provenance record or human approval.
