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

## Inspect coverage before a run

`node reflection.mjs inspect corpus.json inspection.json` writes counts by domain, kind and declared episode, undated source IDs, and groups of exactly equal source text strings. No source text, text fingerprint or input path is copied. The local output still contains potentially sensitive metadata and IDs.

Warnings identify an empty corpus, one declared episode, undated sources, repeated text or one source kind. They are review prompts, not a pass score. Declaring separate episode IDs does not prove independent evidence; repeated text is not automatically deleted or reclassified. Use your judgment about whether the chosen material can answer the intended questions. An empty corpus can appropriately yield insufficient evidence.

## Explain packet selection

`node reflection.mjs preview corpus.json preview.json config.json` lists selected source IDs, question IDs, format, the exact prospective packet byte count, and each omitted source's filter reasons. The same filter function drives preview and build. A date window excludes undated sources; exclusions take effect even when a domain is included. Empty selection is explicit. Omissions can have several reasons.

The preview contains no source text and is not the packet or an approval receipt. It reflects the files at that moment. Review the actual packet, and use an [integrity receipt](receipts.md) if you need to check its later bytes. Byte length is not a token count or a provider context-window guarantee. Omit the configuration argument to use the default quick run.
## Derive an editable selection

`node reflection.mjs selection-plan corpus.json new-selection.json [config.json]` creates the exact ID list selected by the supplied date/domain filters (all supplied sources by default). Remove unwanted IDs, then pass the file to `select`. It contains no source text and discovers no additional files. An empty filter result stays empty.
