# Review a reflection locally

Use the same chosen corpus and configuration throughout a run. These tools check structure and preserve your decisions; they do not assess your personality or verify a model's conclusions. Keep all outputs private.

## Start with an honest draft

`node reflection.mjs draft-report corpus.json draft.json config.json` creates a report with the selected source IDs and questions. Each answer starts as insufficient evidence, confidence 1, no conclusion and no cited evidence. It passes the structural report validator without pretending that an analysis happened. Omit config.json for the default questions.

You may use the file as an editing aid or as a shape reference for a separately obtained model response. Do not accept its empty fields as completed analysis or manufacture support to fill them. Its non-action text asks you to review the evidence first. Validate a completed response with `validate-report` and the original configuration. Structural validity never replaces reviewing the actual evidence, alternative explanations and uncertainty.

## Save the reviewed run inputs together

`node reflection.mjs pack-run corpus.json report.json run.json config.json` validates the report against the chosen configuration and creates the existing comparison-run structure. It stores the selected corpus, configuration and report together. Excluded source records and their text are omitted. This does not prove that a provider used only those sources; it records the local inputs you supply.

The snapshot works directly with `node reflection.mjs compare before-run.json after-run.json comparison.md`. Its combined serialized size must fit 1 MiB; narrow the corpus if necessary. The run still contains selected source text and potentially sensitive report claims. Keep it private. The file is a snapshot of data, not a signed model provenance record or human approval.

## Record your review separately

Run `node reflection.mjs review-plan run.json review.json`. Every question begins as `pending`, with no asserted source checks. Read the original selected sources, the report's cited IDs, counterevidence and alternative explanation. Then edit each decision to `accept`, `revise`, `reject` or `defer`, with an explanatory `note` of at most 2000 characters. Keep `pending` when you have not reviewed an answer.

`checked_sources` lists selected source IDs you personally checked. `counterevidence_checked` records your review of counterevidence. Accept requires both the counterevidence check and every cited source ID. These are self-attestations, not a test that you read something or proof the conclusion is true. Accepting insufficient evidence is allowed; it does not justify starting an action.

`node reflection.mjs validate-review run.json review.json` checks the record, including pending decisions. The SHA-256 digest binds the selected corpus, configuration and report using canonical object-key order. Changes to selected content, answer values, configuration or array order require a new review. Object-key reordering alone does not. Unselected sources in manually assembled runs are omitted before binding. The digest is neither a signature nor proof of reviewer identity, model provenance or prompt version. Keep it private and do not manually replace it to carry decisions onto changed evidence.

## Read decisions alongside their evidence references

`node reflection.mjs review-summary run.json review.json summary.md` creates a question-by-question review with decision counts, your notes and source checks, cited source metadata, the model's status and confidence, conclusion, counterevidence and alternative. Source text is omitted; consult the private run for the original passages. Untrusted fields are escaped in JSON code blocks so Markdown, HTML and code-fence-shaped strings stay data.

Only accepted answers with a substantive conclusion include their optional model action proposal. Pending, rejected, deferred, revision-needed and insufficient-evidence answers provide no action proposal in this view. Acceptance remains your recorded judgment, not verified accuracy or permission to execute anything. To revise a conclusion, edit a report copy against the original evidence, create a new run, and complete a fresh review. The tool never silently rewrites the model's claim to match your decision.
# Inspect evidence coverage

`node reflection.mjs evidence-map run.json new-map.json` links each answer to cited source IDs and episode counts, lists uncited selected sources, and warns about zero citations or a single cited episode. The run-bound map omits source text and report prose, but its metadata can still be sensitive. Counts reflect supplied labels, not independently verified episodes or evidence quality.
# Resume an unfinished review

`node reflection.mjs review-gaps run.json review.json new-gaps.json` lists unchecked citations, missing counterevidence checks, pending decisions and requested revisions. It rejects stale reviews and changes no decisions. Unchecked citations on a rejected or deferred answer are informational; you do not have to accept or finish every answer. A revision requires a new run and review.
