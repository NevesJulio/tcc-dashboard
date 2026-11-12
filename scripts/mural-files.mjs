import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,relative,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
export const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const muralDirectory=join(projectRoot,'public/images/mural');
export async function generateMuralPhotos(){
  await mkdir(muralDirectory,{recursive:true});
  const files=[];
  async function scan(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const path=join(folder,entry.name);if(entry.isDirectory())await scan(path);else if(entry.isFile()&&/\.(jpe?g|png|webp)$/i.test(entry.name))files.push(relative(muralDirectory,path).split('\\').join('/'));}}
  await scan(muralDirectory);
  files.sort((a,b)=>a.localeCompare(b,'pt-BR',{numeric:true}));
  let order=[];
  try{order=JSON.parse(await readFile(join(muralDirectory,'photos.json'),'utf8'));if(!Array.isArray(order))throw Error('photos.json precisa conter uma lista.');}catch(error){if(error.code!=='ENOENT')throw error;}
  const metadata=new Map(order.map((photo,index)=>[photo.file,{...photo,index}]));
  files.sort((a,b)=>(metadata.get(a)?.index??Infinity)-(metadata.get(b)?.index??Infinity)||a.localeCompare(b,'pt-BR',{numeric:true}));
  if(files.length>60)throw Error('O mural permite até 60 imagens. Remova o excedente de public/images/mural/.');
  const photos=files.map(file=>({id:metadata.get(file)?.id||'file:'+file,src:'images/mural/'+file,caption:''}));
  if(new Set(photos.map(p=>p.id)).size!==photos.length)throw Error('IDs duplicados em public/images/mural/photos.json.');
  await mkdir(join(projectRoot,'src/data'),{recursive:true});
  await writeFile(join(projectRoot,'src/data/muralPhotos.generated.json'),JSON.stringify(photos,null,2)+'\n');
  return photos;
}
