import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readJSON, MAX_BYTES } from '../lib/core.mjs';
import { receiptFor } from '../lib/receipt.mjs';

for (const [label,reader,limit] of [['JSON',readJSON,MAX_BYTES],['receipt',receiptFor,8*MAX_BYTES]]) {
test(`${label} growth after descriptor stat is bounded and the descriptor closes on rejection`,()=>{
  const dir=fs.mkdtempSync(join(tmpdir(),'reflection-growing-input-'));
  const path=join(dir,'input.json');
  fs.writeFileSync(path,'{}');
  const original={openSync:fs.openSync,fstatSync:fs.fstatSync,readSync:fs.readSync,closeSync:fs.closeSync};
  let descriptor,opened=0,closed=0,readBytes=0,reads=0;
  try {
    fs.openSync=(...args)=>{
      opened++;
      if (fs.constants.O_NONBLOCK) assert.ok(args[1] & fs.constants.O_NONBLOCK);
      descriptor=original.openSync(...args);return descriptor;
    };
    fs.fstatSync=(fd)=>{
      const stat=original.fstatSync(fd);
      // Grow the same regular file only after its original size was observed.
      const writer=original.openSync(path,'a');
      try {fs.writeSync(writer,Buffer.alloc(limit,32));}
      finally {original.closeSync(writer);}
      return stat;
    };
    fs.readSync=(fd,buffer,offset,length,position)=>{
      assert.equal(fd,descriptor);
      assert.equal(buffer.length,limit+1);
      const count=original.readSync(fd,buffer,offset,Math.min(length,131072),position);
      reads++;readBytes+=count;return count;
    };
    fs.closeSync=(fd)=>{closed++;return original.closeSync(fd);};
    syncBuiltinESMExports();
    assert.throws(()=>reader(path),/exceeds [18] MiB/);
    assert.equal(readBytes,limit+1);
    assert.ok(reads>1);
    assert.equal(opened,1);assert.equal(closed,1);
  } finally {
    Object.assign(fs,original);syncBuiltinESMExports();
    assert.throws(()=>fs.fstatSync(descriptor),{code:'EBADF'});
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
}

test('POSIX FIFO input is rejected without waiting for a writer',{skip:process.platform==='win32'},()=>{
  const dir=fs.mkdtempSync(join(tmpdir(),'reflection-fifo-input-'));
  try {
    const fifo=join(dir,'input.json');
    const created=spawnSync('mkfifo',[fifo],{encoding:'utf8',timeout:2000});
    assert.equal(created.status,0,created.stderr || String(created.error));
    const cli=fileURLToPath(new URL('../reflection.mjs',import.meta.url));
    for (const args of [['validate-corpus',fifo],['receipt',fifo,join(dir,'receipt.json')]]) {
      const result=spawnSync(process.execPath,[cli,...args],{encoding:'utf8',timeout:2000});
      assert.equal(result.status,1,result.stderr || String(result.error));
      assert.match(result.stderr,/regular file/);
    }
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
