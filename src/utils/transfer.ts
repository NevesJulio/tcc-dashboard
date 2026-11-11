import type {Evaluations,Task,TaskStatus} from '../types';
import {researchers} from '../data/researchers';
import {initialTasks} from '../data/project';
export function exportData(evaluations:Evaluations,tasks:Task[]){const blob=new Blob([JSON.stringify({version:1,evaluations,tasks},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ecg-lab-avaliacoes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function parseImport(raw:string):{evaluations:Evaluations;tasks:Task[]}{
const data=JSON.parse(raw);if(!data||data.version!==1||!data.evaluations||typeof data.evaluations!=='object'||Array.isArray(data.evaluations)||!Array.isArray(data.tasks))throw Error('Formato inválido. Use um arquivo exportado pelo ECG Lab.');
const evaluations:Evaluations={};for(const [id,value]of Object.entries(data.evaluations)){const v=value as {favorite?:unknown;notes?:unknown};if(!researchers.some(r=>r.id===id)||!v||typeof v.favorite!=='boolean'||typeof v.notes!=='string'||v.notes.length>20000)throw Error('Avaliação inválida no arquivo.');evaluations[id]={favorite:v.favorite,notes:v.notes};}
const statuses:TaskStatus[]=['A fazer','Em andamento','Concluído'];if(data.tasks.length!==initialTasks.length)throw Error('Lista de tarefas incompatível.');const ids=new Set<string>();const tasks:Task[]=data.tasks.map((t:Task)=>{const original=initialTasks.find(o=>o.id===t?.id);if(!original||ids.has(t.id)||!statuses.includes(t.status))throw Error('Tarefa inválida no arquivo.');ids.add(t.id);return {...original,status:t.status};});return {evaluations,tasks};
}
