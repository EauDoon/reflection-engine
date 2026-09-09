# Review a reflection locally

Use the same chosen corpus and configuration throughout a run. These tools check structure and preserve your decisions; they do not assess your personality or verify a model's conclusions. Keep all outputs private.

## Start with an honest draft

`node reflection.mjs draft-report corpus.json draft.json config.json` creates a report with the selected source IDs and questions. Each answer starts as insufficient evidence, confidence 1, no conclusion and no cited evidence. It passes the structural report validator without pretending that an analysis happened. Omit config.json for the default questions.

You may use the file as an editing aid or as a shape reference for a separately obtained model response. Do not accept its empty fields as completed analysis or manufacture support to fill them. Its non-action text asks you to review the evidence first. Validate a completed response with `validate-report` and the original configuration. Structural validity never replaces reviewing the actual evidence, alternative explanations and uncertainty.
