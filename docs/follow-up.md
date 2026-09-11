# Compare two runs

Save each run privately as a JSON object with exactly `corpus`, `config`, and `report`. Copy in the corresponding JSON objects, not filenames. Each run is validated against its own configuration before comparison.

`node reflection.mjs compare before-run.json after-run.json new-comparison.md`

The comparison identifies question additions/removals, status and confidence changes, and changed source coverage. It does not copy personal conclusions into the comparison. Source IDs should remain stable for the same source; editing an ID can look like a new source. A renamed source is not automatically a new independent episode. A changed answer can reflect different prompts, providers, context windows, or wording. The tool cannot determine whether you improved or the assistant became more accurate.

Object key order is ignored when comparing source and answer fields, so saving equivalent JSON in a different field order does not create an edit. Actual values and array order remain significant. Sources and answers are matched by their stable IDs before field comparison.

Use `templates/follow-up.md` to record an optional experiment's actual outcome. For a later model run, provide corrected source evidence explicitly. Do not use the earlier model portrait as self-confirming evidence of its own conclusions. Reject interpretations that no longer fit. Preserve the packet and receipt separately when exact prompt provenance matters; comparison does not authenticate either run.
# Locate changed inputs and answers

`node reflection.mjs compare-details before-run.json after-run.json new-diff.json` identifies added/removed source and question IDs, changed field names, changes to shared-item ordering, and changed configuration fields. Both selected runs are validated and identified by digest. Source and answer prose is omitted. Inspect the original private files for actual values; changed confidence or wording is not evidence of personal growth or truth. Newly added/removed IDs are reported separately from shared-item ordering.
