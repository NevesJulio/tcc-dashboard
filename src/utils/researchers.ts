import type {Researcher} from '../types';

export const researcherTags = {committee:'Banca do TCC',maxPlanck:'Candidatura Max Planck'};

export function normalizeResearcherSearch(text:string):string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,' ').trim();
}

export function filterResearchers(researchers:Researcher[], filters:{query:string;country:string;area:string;tag:string;onlyFavorites:boolean;favoriteIds:string[];sort:string}):Researcher[] {
  const terms=normalizeResearcherSearch(filters.query).split(' ').filter(Boolean);
  return researchers.filter(r=>{
    const searchable=normalizeResearcherSearch([r.name,r.institution,r.country,r.city,...r.areas,...r.tags].join(' '));
    return terms.every(term=>searchable.includes(term))&&(!filters.country||r.country===filters.country)&&(!filters.area||r.areas.includes(filters.area))&&(!filters.tag||r.tags.includes(filters.tag))&&(!filters.onlyFavorites||filters.favoriteIds.includes(r.id));
  }).sort((a,b)=>filters.sort==='name'?a.name.localeCompare(b.name,'pt-BR'):(b.score??0)-(a.score??0));
}
