# Freeze the packet you reviewed

After reviewing the packet, run:

```sh
node reflection.mjs receipt packet.md new-receipt.json
node reflection.mjs verify-receipt new-receipt.json packet.md
```

The receipt stores the exact packet byte count and SHA-256 digest. It stores no source text, source IDs, file paths, or timestamps. Byte changes, including line endings, fail verification. Keep the receipt locally with your run. Verify the packet immediately before selecting it for upload. The tool does not upload, intercept uploads, or verify what the provider receives.

This detects accidental changes relative to a receipt you trust. It does not authenticate an author, sign a report, prove model compliance, or defeat someone who can replace both packet and receipt. A hash can also reveal whether someone guessed the same sensitive content. Treat receipts as private run metadata. A receipt is optional and is created separately so the original build cannot leave a misleading paired artifact after a partial write failure.
