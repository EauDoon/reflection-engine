# Structured report contract

When format is JSON, return one JSON object, without Markdown fences. Use exactly these fields:

- `version`: integer 1.
- `source_ids`: every selected source ID, once. This records supplied coverage, not proof that the model read it accurately.
- `answers`: exactly one object per selected question, with original integer `id`; `status`; integer `confidence`; string `conclusion`; `evidence` (unique source IDs); string `counterevidence`; string `alternative`; and `action` containing nonempty strings `step`, `check`, `stop`.

Status is `observed pattern`, `inference`, `tentative hypothesis`, or `insufficient evidence`. Insufficient evidence requires an empty conclusion and confidence from 1 to 3. Other statuses require a nonempty conclusion and at least one evidence ID. Confidence 7 to 10 requires at least two distinct episode IDs. Do not turn repeated sources from one event into independent evidence. Counterevidence and alternative must be nonempty, and can explicitly say no counterevidence was supplied or a conclusion cannot be assessed. Include observations and relevant exact quotations or paraphrases within the conclusion, linking each to source IDs. The validator checks references, not semantic truth.

Validate locally with `node reflection.mjs validate-report report.json corpus.json [config.json]`. Use the same corpus and configuration as the packet. The validator rejects unexpected fields, missing answers, out-of-scope references, and basic confidence contradictions. It cannot verify honesty, fairness, diagnoses, quotation accuracy, independence labels, or whether cited text supports a claim. Human review remains necessary. A valid report is not a psychological assessment.
