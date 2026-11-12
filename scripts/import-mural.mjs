import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {muralDirectory,generateMuralPhotos} from './mural-files.mjs';
const path=process.argv[2];
if(!path)throw Error('Uso: npm run mural:import -- "/caminho/ecglab-mural-backup.json"');
const raw=await readFile(path,'utf8');
if(Buffer.byteLength(raw)>80*1024*1024)throw Error('O backup deve ter no máximo 80 MB.');
const data=JSON.parse(raw);
if(data?.kind!=='ecglab-mural'||data.version!==1||!Array.isArray(data.mural?.photos)||data.mural.photos.length>60)throw Error('Arquivo de backup do mural inválido.');
const ids=new Set();
// Valida tudo antes de escrever qualquer arquivo. Não remove fotos existentes.
const photos=data.mural.photos.map(photo=>{
  const match=typeof photo?.src==='string'&&photo.src.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if(typeof photo?.id!=='string'||!photo.id||photo.id.length>100||ids.has(photo.id)||!match||photo.src.length>6000000)throw Error('O backup contém uma foto inválida ou duplicada.');
  ids.add(photo.id);
  const bytes=Buffer.from(match[2],'base64');
  const hash=createHash('sha256').update(bytes).digest('hex').slice(0,20);
  return {id:photo.id,file:`foto-${hash}.${match[1]==='jpeg'?'jpg':match[1]}`,bytes};
});
await mkdir(muralDirectory,{recursive:true});
let previous=[];try{previous=JSON.parse(await readFile(join(muralDirectory,'photos.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const byFile=new Map(photos.map(p=>[p.file,{id:p.id,file:p.file}]));
for(const photo of previous)if(!byFile.has(photo.file))byFile.set(photo.file,photo);
for(const photo of photos)await writeFile(join(muralDirectory,photo.file),photo.bytes);
await writeFile(join(muralDirectory,'photos.json'),JSON.stringify([...byFile.values()],null,2)+'\n');
await generateMuralPhotos();
console.log(`${photos.length} foto(s) preparadas para publicar. Execute git add public/images/mural e faça commit e push normalmente.`);
