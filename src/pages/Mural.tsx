import {useEffect,useRef,useState} from 'react';
import {ArrowDownToLine,ArrowLeft,ArrowRight,ImagePlus,Images,Maximize2,Trash2,Upload,X} from 'lucide-react';
import {Modal} from '../components/Modal';
import {useMural} from '../hooks/useMural';
import {initialMural,type MuralPhoto,type MuralState} from '../data/mural';
import {MAX_MURAL_PHOTOS,moveMuralPhoto,muralPhotoUrl,parseMuralBackup,muralLayout} from '../utils/mural';
import {downloadBlob,exportMuralSlide,portableMural,prepareMuralPhoto} from '../utils/muralImages';

function Photo({photo}:{photo:MuralPhoto}){
  const [failed,setFailed]=useState(false);
  return <>{failed?<span className="mural-photo-missing"><Images size={25}/><span>Foto indisponível</span></span>:<img src={muralPhotoUrl(photo.src,import.meta.env.BASE_URL)} alt={photo.caption||'Memória da trajetória acadêmica'} onError={()=>setFailed(true)} loading="lazy" decoding="async"/>}</>;
}
function MuralBoard({state,presentation=false}:{state:MuralState;presentation?:boolean}){
  const layout=muralLayout(state.photos.length);
  if(!state.photos.length)return null;
  return <section className={'mural-board '+(presentation?'mural-board-slide':'')} aria-label="Mural de fotos">
    <div className="mural-collage">{[...new Set(layout.map(rect=>rect.y))].map(row=><div className="mural-photo-row" key={row}>
      {state.photos.filter((_,index)=>layout[index].y===row).map(photo=><figure className="mural-print" key={photo.id}><Photo photo={photo}/></figure>)}
    </div>)}</div>
  </section>;

}
function Presentation({state,onClose}:{state:MuralState;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();const dialog=ref.current;return()=>dialog?.close();},[]);
  return <dialog ref={ref} className="mural-presentation" onCancel={onClose} aria-label="Apresentação do mural de agradecimentos"><button autoFocus className="mural-presentation-close" onClick={onClose} aria-label="Sair da apresentação"><X size={18}/><span>Sair · Esc</span></button><MuralBoard state={state} presentation/></dialog>;
}
export default function Mural(){
  const {state,save,loading,saving,error}=useMural();
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  const [presenting,setPresenting]=useState(false);
  const [removing,setRemoving]=useState<MuralPhoto|null>(null);
  const [imported,setImported]=useState<MuralState|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);const backupRef=useRef<HTMLInputElement>(null);
  const disabled=loading||saving||busy;
  async function addPhotos(files:File[]){
    if(!files.length||disabled)return;
    if(state.photos.length+files.length>MAX_MURAL_PHOTOS){setMessage(`O mural comporta até ${MAX_MURAL_PHOTOS} fotos. Selecione menos arquivos.`);return;}
    setBusy(true);setMessage('');
    try{
      const added:MuralPhoto[]=[];const failures:string[]=[];
      for(const file of files){try{added.push({id:crypto.randomUUID(),src:await prepareMuralPhoto(file),caption:''});}catch(e){failures.push(e instanceof Error?e.message:'Não foi possível adicionar uma foto.');}}
      if(added.length)await save({...state,photos:[...state.photos,...added]});
      setMessage(`${added.length} foto(s) adicionada(s).${failures.length?' '+failures.join(' '):' Você já pode organizar a ordem.'}`);
    }finally{setBusy(false);}
  }
  async function download(kind:'backup'|'slide'){
    setBusy(true);setMessage('');
    try{if(kind==='slide')await exportMuralSlide(state);else{const portable=await portableMural(state);downloadBlob(new Blob([JSON.stringify({kind:'ecglab-mural',version:1,mural:portable})],{type:'application/json'}),'ecglab-mural-backup.json');}setMessage(kind==='slide'?'Slide PNG gerado. Insira-o na sua apresentação.':'Backup gerado com as fotos e a ordem do mural.');}
    catch(e){setMessage(e instanceof Error?e.message:'Não foi possível baixar o arquivo.');}finally{setBusy(false);}
  }
  if(loading)return <div className="panel" role="status">Abrindo seu mural…</div>;
  return <div className="mural-page">
    <div className="mural-toolbar"><div className="mural-toolbar-primary"><button className="button primary" disabled={disabled} onClick={()=>fileRef.current?.click()}><ImagePlus size={16}/>{busy?'Processando…':'Adicionar fotos locais'}</button></div><div className="mural-toolbar-secondary"><button className="button" disabled={disabled||!state.photos.length} onClick={()=>setPresenting(true)}><Maximize2 size={14}/>Apresentar</button><button className="button" disabled={disabled||!state.photos.length} onClick={()=>download('slide')}><ArrowDownToLine size={14}/>Baixar slide PNG</button></div></div>
    <div className="mural-local-note"><span className="green-dot"/><p><strong>Fotos publicadas: pasta do projeto.</strong> Imagens em public/images/mural/ entram automaticamente no deploy. Fotos adicionadas aqui são rascunhos locais; use o backup para levá-las ao projeto.</p></div>
    {(message||error)&&<div role="status" className={error?'notice':'info-banner'}>{error}{error&&message?' ':''}{message}</div>}
    {!state.photos.length&&<button className="mural-upload-zone" disabled={disabled} onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';}} onDrop={e=>{e.preventDefault();void addPhotos(Array.from(e.dataTransfer.files));}}><span><ImagePlus size={25}/></span><strong>Adicione fotos ao mural</strong><p>Arraste suas fotos para cá ou clique para escolher.</p><small>JPG, PNG ou WebP · até 12 MB por arquivo · seleção múltipla</small></button>}
    <MuralBoard state={state}/>
    <div className="mural-collection-heading"><div><h2>Fotos do mural <span className="count-badge">{state.photos.length}/{MAX_MURAL_PHOTOS}</span></h2><p className="section-subtitle">Organize a ordem das fotos.</p></div><div className="heading-actions"><button className="button" disabled={disabled} onClick={()=>download('backup')}><ArrowDownToLine size={14}/>Backup do mural</button><button className="button" disabled={disabled} onClick={()=>backupRef.current?.click()}><Upload size={14}/>Restaurar backup</button></div></div>
    {state.photos.length>0&&<div className="mural-editor-grid">{state.photos.map((photo,index)=><article className="mural-editor-card" key={photo.id}><div className="mural-editor-photo"><Photo photo={photo}/><span>{String(index+1).padStart(2,'0')}</span></div><div className="mural-editor-actions"><button className="icon-button" disabled={disabled||index===0} aria-label={`Mover foto ${index+1} para antes`} onClick={()=>save(moveMuralPhoto(state,photo.id,-1))}><ArrowLeft size={15}/></button><button className="icon-button" disabled={disabled||index===state.photos.length-1} aria-label={`Mover foto ${index+1} para depois`} onClick={()=>save(moveMuralPhoto(state,photo.id,1))}><ArrowRight size={15}/></button><button className="icon-button mural-remove" disabled={disabled} aria-label={`Remover foto ${index+1}`} onClick={()=>{if(initialMural.photos.some(p=>p.id===photo.id)){setMessage("Para remover uma foto publicada, retire o arquivo de public/images/mural/ e faça commit e push.");}else setRemoving(photo);}}><Trash2 size={14}/></button></div></article>)}</div>}
    <p className="data-note">JPG, PNG e WebP são reduzidos para até 1.600 px ao adicionar. Limpar os dados do navegador também remove o mural salvo. O backup desta página é separado das avaliações da banca.</p>
    <details className="panel mural-publish-help"><summary>Quero que o mural também apareça no site publicado</summary><p>Coloque as imagens em <code>public/images/mural/</code>, faça commit e push. Elas são descobertas automaticamente no build, sem cadastrar uma por uma. Para publicar os rascunhos deste navegador, baixe o backup e execute <code>npm run mural:import -- "/caminho/do/backup.json"</code> na pasta do projeto. Depois faça commit e push. Novas fotos publicadas também aparecem em navegadores com mural local salvo.</p></details>
    <input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Adicionar fotos ao mural" onChange={e=>{const files=Array.from(e.target.files||[]);e.target.value='';void addPhotos(files);}}/>
    <input ref={backupRef} className="sr-only" type="file" accept=".json,application/json" aria-label="Restaurar backup do mural" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{if(file.size>80*1024*1024)throw new Error('O backup deve ter no máximo 80 MB.');setImported(parseMuralBackup(await file.text()));}catch(e){setMessage(e instanceof Error?e.message:'Não foi possível abrir o backup.');}}}/>
    {presenting&&<Presentation state={state} onClose={()=>setPresenting(false)}/>}
    {removing&&<Modal title="Remover esta memória?" onClose={()=>setRemoving(null)}><p>A foto será removida do mural neste navegador. O arquivo original no seu computador não será alterado.</p><div className="modal-links"><button className="button" onClick={()=>setRemoving(null)}>Cancelar</button><button className="button primary" disabled={saving} onClick={async()=>{await save({...state,photos:state.photos.filter(p=>p.id!==removing.id)});setRemoving(null);}}>Remover foto</button></div></Modal>}
    {imported&&<Modal title="Restaurar mural" onClose={()=>setImported(null)}><p>Este backup contém {imported.photos.length} foto(s). Ele substituirá as fotos e a ordem do mural atual. Baixe um backup antes de continuar se quiser guardar a versão atual.</p><div className="modal-links"><button className="button" disabled={busy} onClick={()=>download('backup')}>Guardar versão atual</button><button className="button primary" disabled={disabled} onClick={async()=>{await save(imported);setImported(null);setMessage('Mural restaurado neste navegador.');}}>Substituir e restaurar</button></div></Modal>}
  </div>;
}
