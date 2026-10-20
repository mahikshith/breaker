// Read-only mechanical identity receipt for the Vault art pass.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const [out='out/snake-source-audit',ref='8286cee9cb2e45a531d14d0b4e7c7836475b3e87']=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const retreat=process.argv.includes('--retreat-presentation');
const allowed=new Set(retreat?['constructor','checkBreach','snakePoints','updateLevel']:process.argv.includes('--capture-presentation')?['capturePose','snakePoints','expression','updateAttack','loseBall']:[]);
const raw=fs.readFileSync('src/vault.js','utf8'),current=raw.replaceAll('\r\n','\n');
const baseline=execFileSync('git',['show',ref+':src/vault.js'],{encoding:'utf8'}).replaceAll('\r\n','\n');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
function methods(source){
 const found=[...source.matchAll(/^  ([A-Za-z]\w*)\([^\n]*\)\s*\{/gm)];
 return Object.fromEntries(found.map((m,i)=>[m[1],source.slice(m.index,found[i+1]?.index??source.length).trim()]));
}
const before=methods(baseline),after=methods(current),names=Object.keys(before).filter(n=>!n.startsWith('draw')&&n!=='background');
const changed=names.filter(n=>before[n]!==after[n]);
const rows=source=>[...source.match(/const LAYOUT = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
assert.equal(names.length,55);assert.deepEqual(changed.filter(n=>!allowed.has(n)),[],'all non-whitelisted method chunks remain exact');assert.deepEqual(rows(current),rows(baseline),'field unchanged');
const prefixChecks={};
if(allowed.size&&!retreat)for(const [name,marker]of[['updateAttack','    if (a.t >= 1.22 && a.struck === 1)'],['snakePoints','    const cap = this.capturePose();']]){
 const a=before[name].indexOf(marker),b=after[name].indexOf(marker);assert.ok(a>=0&&b>=0,'presentation boundary retained for '+name);
 prefixChecks[name]=before[name].slice(0,a)===after[name].slice(0,b);assert.ok(prefixChecks[name],'pre-capture method prefix unchanged: '+name);
}
if(allowed.size&&!retreat){
 const guard="    // The committed capture must finish even if the last ball falls during its ending.\n    if (this.phase === 'caught') return;\n";
 assert.ok(after.loseBall.includes(guard),'committed capture guard is explicit');
 prefixChecks.loseBallOtherPhases=after.loseBall.replace(guard,'').replace(/\s+/g,'')===before.loseBall.replace(/\s+/g,'');
 assert.ok(prefixChecks.loseBallOtherPhases,'all former loseBall phases retain identical non-whitespace tokens');
}
if(retreat){
 assert.equal(after.updateAttack,before.updateAttack,'failed-capture sequence unchanged');
 assert.equal(after.loseBall,before.loseBall,'life and committed-capture rules unchanged');
 const marker="    this.phase = 'escape';";
 assert.equal(after.checkBreach.slice(after.checkBreach.indexOf(marker)),before.checkBreach.slice(before.checkBreach.indexOf(marker)),'rescue reward and princess escape unchanged');
}
const exact=names.filter(n=>!allowed.has(n));
const report={scope:'Read-only source comparison, normalized line endings. Draw methods/background excluded; explicit capture or retreat presentation whitelist only when requested. No gameplay execution or rendered-asset admission.',baseline:ref,sourceSHA256:sha(raw),methods:names.length,changed,presentationWhitelist:[...allowed],preCapturePrefixChecks:prefixChecks,exactMethods:exact.length,layoutIdentical:true,counts:{cells:rows(current).join('').length,granite:rows(current).join('').split('#').length-1,bars:rows(current).join('').split('=').length-1},baselineMechanicsSHA256:sha(exact.map(n=>before[n]).join('\n')),currentMechanicsSHA256:sha(exact.map(n=>after[n]).join('\n')),methodHashes:Object.fromEntries(names.map(n=>[n,sha(after[n])]))};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({methods:report.methods,changed,counts:report.counts,source:report.sourceSHA256,out}));
