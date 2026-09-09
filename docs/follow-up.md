# Compare two runs

Save each run privately as a JSON object with exactly `corpus`, `config`, and `report`. Copy in the corresponding JSON objects, not filenames. Each run is validated against its own configuration before comparison.

`node reflection.mjs compare before-run.json after-run.json new-comparison.md`

The comparison identifies question additions/removals, status and confidence changes, and changed source coverage. It does not copy personal conclusions into the comparison. Source IDs should remain stable for the same source; editing an ID can look like a new source. A renamed source is not automatically a new independent episode. A changed answer can reflect different prompts, providers, context windows, or wording. The tool cannot determine whether you improved or the assistant became more accurate.

Use `templates/follow-up.md` to record an optional experiment's actual outcome. For a later model run, provide corrected source evidence explicitly. Do not use the earlier model portrait as self-confirming evidence of its own conclusions. Reject interpretations that no longer fit. Preserve the packet and receipt separately when exact prompt provenance matters; comparison does not authenticate either run.
