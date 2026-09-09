import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { exact, requireThat } from './core.mjs';
const LIMIT=8*1024*1024;
export function receiptFor(path) {
  requireThat(statSync(path).isFile() && statSync(path).size<=LIMIT,'Packet must be a file of at most 8 MiB');
  const bytes=readFileSync(path);
  requireThat(bytes.length<=LIMIT,'Packet exceeds 8 MiB');
  return {version:1,algorithm:'sha256',bytes:bytes.length,digest:createHash('sha256').update(bytes).digest('hex')};
}
export function verifyReceipt(receipt, path) {
  exact(receipt,['version','algorithm','bytes','digest'],'Receipt');
  requireThat(receipt.version===1 && receipt.algorithm==='sha256' && Number.isInteger(receipt.bytes) && receipt.bytes>=0 && receipt.bytes<=LIMIT && typeof receipt.digest==='string' && /^[a-f0-9]{64}$/.test(receipt.digest),'Invalid receipt');
  const actual=receiptFor(path);
  requireThat(actual.bytes===receipt.bytes && actual.digest===receipt.digest,'Receipt mismatch: packet bytes changed');
  return true;
}
