# Prepare a corpus

Copy `templates/corpus.json` to a private folder outside this repository. Add only material you choose for this run. The empty template is valid and should produce an insufficient-evidence response, not an invented portrait.

Each source needs a unique `id` (letters, digits, underscores, hyphens), an `episode` ID, a calendar `date` in YYYY-MM-DD or `null`, a short `domain`, a `kind`, and `text`. Kind is `self-report`, `quotation`, or `observation`. These are supplied labels, not independent verification. Use the same episode ID for retellings of the same event. A quotation from an assistant is not proof about you. Distinguish actions from aspirations and hypothetical questions in the text.

Keep third-party names and identifying details out where possible. Include opposing examples and outcomes, not just unresolved questions. Do not submit material you are not authorized to share. Review your chosen provider's policies before uploading anything. Local preparation does not make a later provider upload private.

`examples/synthetic-corpus.json` is fictional test material, not a sample real person. Do not merge it into your own corpus. Never commit personal corpora, generated packets, reports, or redaction maps. The companion never needs credentials, assistant history, or a network connection.
