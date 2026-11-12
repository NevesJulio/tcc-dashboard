import photos from './muralPhotos.generated.json';
import type {MuralState} from '../types/mural';
export type {MuralPhoto,MuralState} from '../types/mural';
/** Gerado automaticamente a partir de public/images/mural/ ao iniciar ou compilar. */
export const initialMural:MuralState = {title:'',subtitle:'',photos};
