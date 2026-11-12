export interface MuralPhoto { id:string; src:string; caption:string }
// title/subtitle são mantidos para compatibilidade com backups antigos; não são exibidos.
export interface MuralState { title:string; subtitle:string; photos:MuralPhoto[] }
