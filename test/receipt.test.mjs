import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { receiptFor, verifyReceipt } from '../lib/receipt.mjs';
test('exact-byte receipt detects edits and rejects malformed claims',()=>{
  const dir=mkdtempSync(join(tmpdir(),'reflection-receipt-'));
  try {
    const path=join(dir,'packet.md');writeFileSync(path,'synthetic\n');
    const receipt=receiptFor(path);assert.equal(verifyReceipt(receipt,path),true);
    assert.deepEqual(Object.keys(receipt),['version','algorithm','bytes','digest']);
    writeFileSync(path,'synthetic\r\n');assert.throws(()=>verifyReceipt(receipt,path));
    assert.throws(()=>verifyReceipt({...receipt,algorithm:'md5'},path));
  } finally {rmSync(dir,{recursive:true,force:true});}
});
