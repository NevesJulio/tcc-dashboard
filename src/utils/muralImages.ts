import {muralPhotoUrl,muralLayout} from './mural';
import type {MuralState} from '../data/mural';

function loadImage(src:string):Promise<HTMLImageElement>{
  return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Não foi possível abrir uma das imagens. Use um arquivo JPG, PNG ou WebP válido.'));img.src=src;});
}
export function downloadBlob(blob:Blob,filename:string){
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function prepareMuralPhoto(file:File):Promise<string>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error(`${file.name}: use JPG, PNG ou WebP.`);
  if(file.size>12*1024*1024)throw new Error(`${file.name}: o limite é 12 MB por foto.`);
  const url=URL.createObjectURL(file);
  try{
    const image=await loadImage(url);const ratio=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Seu navegador não conseguiu processar a imagem.');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',.86);
  }finally{URL.revokeObjectURL(url);}
}
export async function portableMural(state:MuralState):Promise<MuralState>{
  const photos=await Promise.all(state.photos.map(async photo=>{
    if(photo.src.startsWith('data:image/'))return photo;
    const response=await fetch(muralPhotoUrl(photo.src,import.meta.env.BASE_URL));
    if(!response.ok)throw new Error('Não foi possível incluir uma foto do projeto no backup.');
    const blob=await response.blob();
    const src=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Não foi possível ler a foto.'));reader.readAsDataURL(blob);});
    return {...photo,src};
  }));return {...state,photos};
}
export async function exportMuralSlide(state:MuralState){
  if(!state.photos.length)throw new Error('Adicione fotos antes de baixar o slide.');
  const images=await Promise.all(state.photos.map(p=>loadImage(muralPhotoUrl(p.src,import.meta.env.BASE_URL))));
  const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Seu navegador não conseguiu gerar o slide.');
  const layout=muralLayout(images.length);
  images.forEach((image,index)=>{
    const rect=layout[index];
    const x=Math.round(rect.x*canvas.width),y=Math.round(rect.y*canvas.height);
    const width=Math.round((rect.x+rect.width)*canvas.width)-x;
    const height=Math.round((rect.y+rect.height)*canvas.height)-y;
    const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
    ctx.save();ctx.beginPath();ctx.rect(x,y,width,height);ctx.clip();
    ctx.drawImage(image,x+(width-image.naturalWidth*scale)/2,y+(height-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);ctx.restore();
  });
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Não foi possível gerar o slide.')),'image/png'));
  downloadBlob(blob,'mural-fotos.png');
}
