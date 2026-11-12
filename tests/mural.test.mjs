import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const directory=mkdtempSync(join(tmpdir(),'ecglab-mural-test-'));
execFileSync(process.execPath,['node_modules/typescript/bin/tsc','src/utils/mural.ts','--outDir',directory,'--module','commonjs','--target','ES2022','--skipLibCheck']);
const require=createRequire(import.meta.url);
const {parseMuralBackup,moveMuralPhoto,muralPhotoUrl,mergePublishedMural,muralLayout}=require(join(directory,'utils/mural.js'));
after(()=>rmSync(directory,{recursive:true,force:true}));
const state=()=>({title:'Obrigado!',subtitle:'Minha trajetória',photos:[{id:'a',src:'data:image/jpeg;base64,YQ==',caption:'Família'},{id:'b',src:'data:image/png;base64,Yg==',caption:'Amigos'}]});
const backup=mural=>JSON.stringify({kind:'ecglab-mural',version:1,mural});
test('backup preserva as fotos, legendas e textos',()=>{const mural=state();assert.deepEqual(parseMuralBackup(backup(mural)),mural);});
test('restauração rejeita tipo, versão, fotos externas e IDs duplicados',()=>{assert.throws(()=>parseMuralBackup('{'));assert.throws(()=>parseMuralBackup(JSON.stringify({kind:'avaliacoes',version:1,mural:state()})));assert.throws(()=>parseMuralBackup(JSON.stringify({kind:'ecglab-mural',version:2,mural:state()})));const mural=state();mural.photos[0].src='javascript:alert(1)';assert.throws(()=>parseMuralBackup(backup(mural)));const duplicate=state();duplicate.photos[1].id='a';assert.throws(()=>parseMuralBackup(backup(duplicate)));});
test('restauração aplica limites e aceita um mural vazio',()=>{const mural=state();mural.title='x'.repeat(121);assert.throws(()=>parseMuralBackup(backup(mural)));assert.throws(()=>parseMuralBackup(backup({...state(),photos:Array.from({length:61},(_,i)=>({...state().photos[0],id:String(i)}))})));assert.deepEqual(parseMuralBackup(backup({...state(),photos:[]})).photos,[]);});
test('reordenar preserva os dados e não altera o estado anterior',()=>{const mural=state();const moved=moveMuralPhoto(mural,'b',-1);assert.deepEqual(moved.photos.map(p=>p.id),['b','a']);assert.deepEqual(mural.photos.map(p=>p.id),['a','b']);assert.equal(moveMuralPhoto(mural,'a',-1),mural);assert.equal(moveMuralPhoto(mural,'b',1),mural);assert.equal(moveMuralPhoto(mural,'desconhecido',1),mural);});
test('caminhos funcionam no GitHub Pages e mantêm imagens locais embutidas',()=>{assert.equal(muralPhotoUrl('images/mural/familia.jpg','/tcc-dashboard/'),'/tcc-dashboard/images/mural/familia.jpg');assert.equal(muralPhotoUrl('/images/mural/familia.jpg','/tcc-dashboard/'),'/tcc-dashboard/images/mural/familia.jpg');assert.equal(muralPhotoUrl(state().photos[0].src,'/tcc-dashboard/'),state().photos[0].src);});

test('novas fotos publicadas aparecem mesmo com rascunhos locais salvos',()=>{
 const local=state();const published={title:'',subtitle:'',photos:[{id:'b',src:'images/mural/b.jpg',caption:''},{id:'c',src:'images/mural/c.jpg',caption:''}]};
 const merged=mergePublishedMural(local,published);
 assert.deepEqual(merged.photos.map(p=>p.id),['a','b','c']);
 assert.equal(merged.photos[1].src,'images/mural/b.jpg');
 assert.equal(merged.photos[0].src,local.photos[0].src);
 assert.equal(merged.title,'');
});
test('arquivos removidos do projeto não reaparecem a partir do cache antigo',()=>{
 const local={...state(),photos:[...state().photos,{id:'removida',src:'images/mural/antiga.jpg',caption:''}]};
 const merged=mergePublishedMural(local,{title:'',subtitle:'',photos:[]});
 assert.deepEqual(merged.photos.map(p=>p.id),['a','b']);
});
test('mosaico preenche toda a área sem espaços de 1 até 60 fotos',()=>{
 assert.deepEqual(muralLayout(0),[]);
 for(let count=1;count<=60;count++){
  const layout=muralLayout(count);assert.equal(layout.length,count);
  const area=layout.reduce((sum,r)=>sum+r.width*r.height,0);assert.ok(Math.abs(area-1)<1e-10);
  for(const rect of layout){assert.ok(rect.x>=0&&rect.y>=0);assert.ok(rect.x+rect.width<=1+1e-10);assert.ok(rect.y+rect.height<=1+1e-10);}
  for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
   const a=layout[i],b=layout[j];const overlapX=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);const overlapY=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
   assert.ok(overlapX<1e-10||overlapY<1e-10);
  }
 }
});
