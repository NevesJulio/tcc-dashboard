import type {MuralState} from '../types/mural';

export const MAX_MURAL_PHOTOS=60;
export function parseMuralBackup(raw:string):MuralState {
  const data=JSON.parse(raw);
  if(data?.kind!=='ecglab-mural'||data.version!==1)throw new Error('Selecione um backup do mural do ECG Lab.');
  const state=data.mural;
  if(!state||typeof state.title!=='string'||state.title.length>120||typeof state.subtitle!=='string'||state.subtitle.length>300||!Array.isArray(state.photos)||state.photos.length>MAX_MURAL_PHOTOS)throw new Error('O backup contém informações inválidas.');
  const ids=new Set<string>();
  const photos=state.photos.map((photo:unknown)=>{
    if(!photo||typeof photo!=='object')throw new Error('Foto inválida no backup.');
    const p=photo as Record<string,unknown>;
    if(typeof p.id!=='string'||!p.id||p.id.length>100||ids.has(p.id)||typeof p.caption!=='string'||p.caption.length>160||typeof p.src!=='string'||p.src.length>6000000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(p.src))throw new Error('Foto inválida ou duplicada no backup.');
    ids.add(p.id);
    return {id:p.id,src:p.src,caption:p.caption};
  });
  return {title:state.title,subtitle:state.subtitle,photos};
}
export function moveMuralPhoto(state:MuralState,id:string,direction:-1|1):MuralState {
  const from=state.photos.findIndex(photo=>photo.id===id);const to=from+direction;
  if(from<0||to<0||to>=state.photos.length)return state;
  const photos=[...state.photos];[photos[from],photos[to]]=[photos[to],photos[from]];
  return {...state,photos};
}
export function muralPhotoUrl(src:string,base:string):string {
  return src.startsWith('data:image/')?src:base+src.replace(/^\/+/, '');
}

/** O projeto é a fonte das fotos publicadas; fotos locais continuam disponíveis como rascunho. */
export function mergePublishedMural(local:MuralState,published:MuralState):MuralState {
  const publishedById=new Map(published.photos.map(photo=>[photo.id,photo]));
  const seen=new Set<string>();
  const photos=local.photos.flatMap(photo=>{
    const current=publishedById.get(photo.id);
    if(seen.has(photo.id))return [];
    seen.add(photo.id);
    return current?[current]:photo.src.startsWith('data:image/')?[photo]:[];
  });
  for(const photo of published.photos)if(!seen.has(photo.id))photos.push(photo);
  return {title:'',subtitle:'',photos};
}
/** Cada linha preenche toda a largura, inclusive quando a quantidade não é múltipla de colunas. */
export function muralLayout(count:number):{x:number;y:number;width:number;height:number}[] {
  if(count<=0)return [];
  const rows=Math.max(1,Math.round(Math.sqrt(count*9/16)));
  const base=Math.floor(count/rows),extra=count%rows;
  return Array.from({length:rows},(_,row)=>{
    const columns=base+(row<extra?1:0);
    return Array.from({length:columns},(_,column)=>({x:column/columns,y:row/rows,width:1/columns,height:1/rows}));
  }).flat();
}
