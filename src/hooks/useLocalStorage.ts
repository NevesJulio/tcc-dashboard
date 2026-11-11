import {useState} from 'react';
export function useLocalStorage<T>(key:string,initial:T,validate?:(value:unknown)=>boolean):[T,(value:T|((previous:T)=>T))=>void,string|null] {
const [error,setError]=useState<string|null>(null);
const [value,setValue]=useState<T>(()=>{try {const raw=localStorage.getItem(key); if(!raw)return initial; const parsed:unknown=JSON.parse(raw);return (!validate||validate(parsed))?parsed as T:initial;}catch{return initial;}});
function update(next:T|((previous:T)=>T)){setValue(previous=>{const result=typeof next==='function'?(next as (p:T)=>T)(previous):next;try{localStorage.setItem(key,JSON.stringify(result));setError(null);}catch{setError('Não foi possível salvar neste navegador. Exporte seus dados antes de sair.');}return result;});}
return [value,update,error];
}
