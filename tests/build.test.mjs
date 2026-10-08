import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,cp,writeFile,readFile,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {build} from '../scripts/build.mjs';
import {verifyDist} from '../scripts/verify-dist.mjs';
test('isolated build drops stale public files, preserves prior output, and verifies hashes',async()=>{
 await mkdir('artifacts',{recursive:true});const root=await mkdtemp(resolve('artifacts/build-test-'));
 for(const path of ['site','docs','README.md','CREDITS.md','CONTRIBUTING.md','LICENSE'])await cp(path,join(root,path),{recursive:true});
 await mkdir(join(root,'dist'));await writeFile(join(root,'dist','stale-private.txt'),'must not be published');
 const first=await build(root);await assert.rejects(access(join(root,'dist/stale-private.txt')));
 assert.equal(await readFile(join(first.previousOutput,'stale-private.txt'),'utf8'),'must not be published');
 await verifyDist(join(root,'dist'));const manifest=await readFile(join(root,'dist/build-manifest.json'),'utf8');
 await build(root);assert.equal(await readFile(join(root,'dist/build-manifest.json'),'utf8'),manifest);
 await writeFile(join(root,'dist/extra.txt'),'unexpected');await assert.rejects(verifyDist(join(root,'dist')),/Unexpected public file/);
});
