# Review one optional experiment

Start only if you choose to try a small, appropriate action. A model proposal is unverified. Reflection Engine is not therapy, diagnosis or a validated assessment, and its tools do not execute actions, send messages, schedule reminders or call a provider.

After completing a [human review](review-workflow.md), choose one accepted question with a substantive answer:

```sh
node reflection.mjs plan-experiment run.json review.json 4 experiment.json
```

Replace 4 with your chosen question ID. Pending or nonaccepted answers and insufficient-evidence drafts cannot create a plan. The file contains the chosen action's step, check and stop text, bound to the selected run. It begins with no start date, observations or outcome. Inspect the action before doing anything. A plan is not a record that the action happened.

The plan also copies the complete human review into `acceptance_review`, preserving the recorded acceptance and its source/counterevidence checks against the same run. This includes your review notes, so keep the plan private unless you choose to share that context. Leave this snapshot unchanged when editing outcomes or changing your current review. It is self-attested recorded acceptance, not authenticated provenance or proof that review happened at a particular time. A hand-built record without this snapshot is rejected; the tool cannot detect someone inventing a structurally valid acceptance snapshot. Older plans missing it require a newly recorded acceptance review and a new plan; retain old observations separately rather than implying undocumented past acceptance.

## Record what actually happened

Edit a private copy of the experiment JSON. Set `started` to your declared YYYY-MM-DD start date if you started. Add at most 30 chronological `observations`, each containing `date`, `kind` (either `observation` or `stop`) and a `note` of at most 2000 characters. Dates must be on or after the start. For example:

```json
{"date":"2026-03-02","kind":"observation","note":"Synthetic example: the planned session occurred; the schedule was also lighter that day."}
```

Leave `decision` as `pending`, `reviewed` as null, and `reason` and `alternative` empty until you review the outcome. To close the review, set a real review date on or after all observations, choose `continue`, `adjust` or `stop`, and give a bounded reason and a competing explanation. Continue/adjust requires at least one observation. A stop observation requires a stop decision. You can choose stop before starting, with no observations; explain why and leave the start date null. The tool cannot verify your dates or observations.

```sh
node reflection.mjs review-experiment run.json review.json experiment.json experiment-review.md
```

The summary validates the unchanged action, dates, notes and run binding, then displays the recorded decision as self-reported data. It does not judge whether the action worked, infer a cause, or treat confidence as progress. If you later reject the answer in your human review, you can still preserve an experiment's observations or stop decision; the summary flags that the answer is no longer accepted. Altering the underlying report, selected evidence or action requires a new run and review, not editing a digest. An adjustment decision records intent only; it does not silently change or launch the action.
# Check an edited experiment without exporting it

`node reflection.mjs validate-experiment run.json review.json experiment.json` validates dates, observations, action preservation and run-bound acceptance without writing a summary. Valid pending plans pass, without implying that the trial started or succeeded. A structurally valid record remains self-reported. Invalid records exit with code 1 without echoing observations.
# Respect withdrawn acceptance and stop observations

Continue or adjust decisions require the current review to still accept the chosen answer. If acceptance is withdrawn, preserve the observations and choose stop, or retain an unfinished pending record without asserting continuation. An explicit stop observation must be the last observation, even on the same date. Put later reflections in a separate chosen source. These checks govern the local record; they do not execute, enforce or authenticate a real-world stop.
