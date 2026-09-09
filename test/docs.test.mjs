import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { questions } from '../lib/packet.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('bounded standalone question wording matches preserved upstream catalog',()=>{
  const text=readFileSync(resolve(root,'Reflection-Engine-Bounded.md'),'utf8');
  for(const id of [4,11,17]) assert.ok(text.includes(`${id}. ${questions()[id-1].text}`));
});
test('new onboarding links resolve locally',()=>{
  const files=['README.md','Reflection-Engine-Bounded.md',...readdirSync(resolve(root,'docs')).map(n=>'docs/'+n)];
  for(const file of files) {
    const path=resolve(root,file),text=readFileSync(path,'utf8');
    for(const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if(!/^(https?:|#)/.test(match[1])) assert.ok(existsSync(resolve(dirname(path),match[1])),`${file}: ${match[1]}`);
    }
  }
});
