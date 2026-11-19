import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';

const directory=mkdtempSync(join(tmpdir(),'ecglab-researchers-'));
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','src/utils/researchers.ts','src/utils/transfer.ts','--outDir',directory,'--module','commonjs','--target','ES2022','--skipLibCheck']);
const require=createRequire(import.meta.url);
const {filterResearchers,researcherTags}=require(join(directory,'utils/researchers.js'));
const {researchers}=require(join(directory,'data/researchers.js'));
const {parseImport}=require(join(directory,'utils/transfer.js'));
const {initialTasks}=require(join(directory,'data/project.js'));
after(()=>rmSync(directory,{recursive:true,force:true}));
const filter=(patch={})=>filterResearchers(researchers,{query:'',country:'',area:'',tag:'',onlyFavorites:false,favoriteIds:[],sort:'relevance',...patch});

test('separa os três perfis da candidatura dos oito candidatos à banca',()=>{
  assert.deepEqual(filter({tag:researcherTags.maxPlanck}).map(r=>r.id),['mueller','eickhoff','helmstaedter']);
  assert.equal(filter({tag:researcherTags.committee}).length,8);
  assert.equal(filter().length,11);
});
test('busca por nome sem acentos, instituição, cidade, área e tag',()=>{
  assert.deepEqual(filter({query:'klaus robert muller'}).map(r=>r.id),['mueller']);
  assert.deepEqual(filter({query:'Julich neuroimagem'}).map(r=>r.id),['eickhoff']);
  assert.equal(filter({query:'candidatura max planck'}).length,3);
  assert.deepEqual(filter({query:'Frankfurt microscopia'}).map(r=>r.id),['helmstaedter']);
});
test('combina finalidade, busca, país, área e favoritos sem alterar a lista original',()=>{
  const ids=researchers.map(r=>r.id);
  assert.deepEqual(filter({tag:researcherTags.maxPlanck,query:'ML',country:'Brasil'}),[]);
  assert.deepEqual(filter({tag:researcherTags.maxPlanck,country:'Alemanha',area:'Machine Learning',onlyFavorites:true,favoriteIds:['eickhoff','schneider']}).map(r=>r.id),['eickhoff']);
  assert.deepEqual(filter({tag:researcherTags.maxPlanck,sort:'name'}).map(r=>r.id),['mueller','helmstaedter','eickhoff']);
  assert.deepEqual(researchers.map(r=>r.id),ids);
});
test('notas e favoritos antigos e novos continuam compatíveis com a importação',()=>{
  for(const id of ['schneider','mueller','eickhoff','helmstaedter']){
    const evaluations={[id]:{favorite:true,notes:'Perguntas para a candidatura.'}};
    assert.deepEqual(parseImport(JSON.stringify({version:1,evaluations,tasks:initialTasks})).evaluations,evaluations);
  }
});
