# Prepare explicitly chosen sources

Keep working files in an existing private folder outside this repository. No command scans folders, resolves links, fetches accounts, or reads assistant memory. Only the paths you name are opened.

## Import one text file

Copy [source-metadata.json](../templates/source-metadata.json) and fill in its source ID, episode, date (or null), domain and kind. Then run:

```sh
node reflection.mjs import-text chosen.txt metadata.json new-corpus.json
```

This accepts plain UTF-8 text, including an optional BOM, and preserves its content and line breaks. It does not parse PDFs, chat archives, or rich documents. Choose a relevant excerpt yourself before importing. The normal 20000-character source limit applies; the file reader stops at 1 MiB. Invalid bytes or metadata fail before an output is created. Embedded requests remain untrusted source text.

The output uses the existing corpus contract and can be validated, redacted or built into a packet. Input paths and source text are not printed. Output files never overwrite existing files. New preparation JSON outputs must fit the 1 MiB reader limit, including their serialized metadata.

## Combine chosen corpora

`node reflection.mjs merge new-corpus.json first.json second.json` combines 2 to 20 explicitly named inputs in their given order. A repeated source ID is included once only when every field agrees, ignoring object key ordering. A conflicting version fails instead of silently choosing a winner. Resolve it yourself or give a genuinely different source its own ID. Different IDs with repeated text remain separate for later review; this command does not invent independent episodes. The combined result must fit 200 sources and 1 MiB before a file is created.

## Choose individual episodes

Copy [selection.json](../templates/selection.json) and set `source_ids` to the exact source IDs you want, for example `["S3", "S1"]`. Run `node reflection.mjs select corpus.json selection.json selected.json`. The new corpus contains only those sources, in the requested order, with every source field preserved. Unknown or duplicate IDs fail. An empty list deliberately produces an empty corpus; it never means all sources. Domain/date configuration can further narrow this selected corpus during packet building. Source IDs describe your choices, not proof of independence or consent from people mentioned in the text.
