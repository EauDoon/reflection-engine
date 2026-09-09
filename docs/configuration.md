# Select a run

`node reflection.mjs build corpus.json new-packet.md config.json`

Copy `templates/config.json`. `quick` selects 4, 11, 17; `full` selects all 22; `custom` requires unique IDs in `questions`. Non-custom modes require an empty questions array, so accidental choices never disappear silently. The catalog retains upstream IDs.

`domains` includes only matching domains when nonempty. `exclude` always wins. Domains match exactly. `from` and `to` are inclusive calendar dates or null. Any active date bound excludes sources with unknown dates. Filters remove sources from the actual packet, not just a suggestion to ignore them. Keep excluded private details out of included source text too; this is not semantic redaction.

An empty filtered corpus remains valid and calls for insufficient evidence. `format` is `markdown` or `json`. JSON requires the structured report contract included by the packet builder. Configuration does not establish consent for other accounts or history.
