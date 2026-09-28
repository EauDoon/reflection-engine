import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { receiptFor, verifyReceipt } from '../lib/receipt.mjs';

test('verification accepts an otherwise exact SHA-256 digest written in uppercase', () => {
  const dir = mkdtempSync(join(tmpdir(), 'reflection-receipt-case-'));
  try {
    const path = join(dir, 'packet.md');
    writeFileSync(path, 'synthetic\n');
    const receipt = receiptFor(path);
    const upper = { ...receipt, digest: receipt.digest.toUpperCase() };
    assert.notEqual(upper.digest, receipt.digest);
    assert.equal(verifyReceipt(upper, path), true);
    assert.throws(() => verifyReceipt({ ...upper, digest: 'A'.repeat(64) }, path), /mismatch|Invalid receipt/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
