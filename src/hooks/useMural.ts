import {useEffect,useState} from 'react';
import {initialMural,type MuralState} from '../data/mural';
import {mergePublishedMural} from '../utils/mural';

function openDatabase():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('ecglab-mural',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('workspace');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Feche outras abas do painel e tente novamente.'));
  });
}
export function useMural(){
  const [state,setState]=useState<MuralState>(initialMural);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    (async()=>{
      let db:IDBDatabase|undefined;
      try{
        db=await openDatabase();
        const transaction=db.transaction('workspace','readonly');
        const request=transaction.objectStore('workspace').get('mural');
        request.onsuccess=()=>{if(active&&request.result)setState(mergePublishedMural(request.result as MuralState,initialMural));};
        await new Promise<void>((resolve,reject)=>{transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);});
      }catch{if(active)setError('O armazenamento local está indisponível. Você pode montar o mural e baixar um backup, mas ele não será salvo ao fechar a página.');}
      finally{db?.close();if(active)setLoading(false);}
    })();
    return()=>{active=false;};
  },[]);
  async function save(next:MuralState){
    setSaving(true);let db:IDBDatabase|undefined;
    try{
      db=await openDatabase();
      await new Promise<void>((resolve,reject)=>{
        const transaction=db!.transaction('workspace','readwrite');
        transaction.objectStore('workspace').put(next,'mural');
        transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);
      });
      setError('');
    }catch{setError('Não foi possível salvar no navegador. Seu mural continua aberto: baixe um backup antes de sair.');}
    finally{db?.close();setState(next);setSaving(false);}
  }
  return {state,save,loading,saving,error};
}
