# Redact before building

`node reflection.mjs redact corpus.json rules.json new-corpus.json`

Rules are JSON with exactly `version: 1` and `terms`, a list of literal strings. A matching term in source **text** becomes `[REDACTED_1]`, `[REDACTED_2]`, and so on in the order listed. Matches are case-sensitive, longest first, and non-cascading. Regex punctuation is literal. The original corpus remains unchanged; output must be a new file. No secrets or matched terms are printed by the command.

Use an external private folder for both corpus and rules. The rules themselves reveal the values you intend to remove, so do not upload them. Review the new corpus before building a packet from it. A match count only measures literal substitutions. This is not automatic personal-data detection or guaranteed anonymization: spelling variants, metadata, dates, domains, and indirect identifying details remain. Remove or generalize those manually. Removing details can change meaning; preserve enough context for honest uncertainty. Redaction labels can link mentions across sources. Do not share an output merely because this command succeeded.
# Preview substitutions before producing a corpus

`node reflection.mjs preview-redaction corpus.json rules.json new-preview.json` counts actual substitutions per source and per numbered label using the same longest-first, non-cascading matching as `redact`. It lists labels with zero matches without copying rules or source text. Metadata remains unredacted. A shorter overlapping term may have zero matches because the longer term consumed it. The preview creates only the explicitly named count file, and does not alter or share the corpus.
