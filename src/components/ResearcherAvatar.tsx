import {useState} from 'react';
import type {Researcher} from '../types';

export function ResearcherAvatar({researcher,large=false}:{researcher:Researcher;large?:boolean}) {
  const [failedImage,setFailedImage]=useState<string|null>(null);
  const image=researcher.image;
  const showImage=Boolean(image && failedImage!==image);
  const initials=researcher.name.split(' ').map(name=>name[0]).slice(0,2).join('');
  return <span className={`avatar avatar-${researcher.id}${large?' avatar-large':''}`}>
    {showImage ? <img src={`${import.meta.env.BASE_URL}${image}`} alt={`Foto de ${researcher.name}`} width={large?72:45} height={large?72:45} loading="lazy" decoding="async" onError={()=>setFailedImage(image!)}/> : <span aria-label={researcher.name}>{initials}</span>}
  </span>;
}
