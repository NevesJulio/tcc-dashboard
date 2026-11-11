export interface Researcher { id:string; name:string; institution:string; country:string; city:string; areas:string[]; bio:string; relevance:string; score:number; website:string; lattes?:string }
export interface Evaluation { favorite:boolean; notes:string }
export type Evaluations = Record<string, Evaluation>;
export type TaskStatus = 'A fazer' | 'Em andamento' | 'Concluído';
export interface Task { id:string; title:string; category:string; status:TaskStatus }
export interface DocumentLink { title:string; category:string; description:string; url:string|null }
export type Page = 'overview'|'committee'|'documents'|'experiments'|'timeline'|'about';
