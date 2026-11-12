import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=await mkdtemp(join(tmpdir(),'ecglab-mural-files-'));
after(()=>rm(root,{recursive:true,force:true}));
await mkdir(join(root,'scripts'),{recursive:true});
for(const file of ['mural-files.mjs','import-mural.mjs'])await copyFile(join('scripts',file),join(root,'scripts',file));
const {generateMuralPhotos,muralDirectory}=await import(pathToFileURL(join(root,'scripts/mural-files.mjs')));
test('descobre imagens em subpastas e aplica ordenação numérica',async()=>{
 await mkdir(join(muralDirectory,'viagem'),{recursive:true});
 for(const file of ['10-amigos.jpeg','02-familia.JPG','ignorar.txt','viagem/03-praia.webp'])await writeFile(join(muralDirectory,file),'fixture');
 const photos=await generateMuralPhotos();assert.equal(photos.length,3);
 assert.deepEqual(photos.map(p=>p.src),['images/mural/02-familia.JPG','images/mural/10-amigos.jpeg','images/mural/viagem/03-praia.webp']);
});
test('extrai backup para o projeto e preserva IDs e ordem sem duplicar arquivos',async()=>{
 const photos=[{id:'local-b',src:'data:image/jpeg;base64,Yg==',caption:''},{id:'local-a',src:'data:image/png;base64,YQ==',caption:''}];
 const backup=join(root,'backup.json');await writeFile(backup,JSON.stringify({kind:'ecglab-mural',version:1,mural:{title:'',subtitle:'',photos}}));
 for(let i=0;i<2;i++)execFileSync(process.execPath,[join(root,'scripts/import-mural.mjs'),backup]);
 const generated=await generateMuralPhotos();assert.equal(generated.length,5);assert.deepEqual(generated.slice(0,2).map(p=>p.id),['local-b','local-a']);
 const image=await readFile(join(root,'public',generated[0].src));assert.equal(image.toString(),'b');
});
