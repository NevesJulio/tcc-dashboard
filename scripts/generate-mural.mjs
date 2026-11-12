import {generateMuralPhotos} from './mural-files.mjs';
const photos=await generateMuralPhotos();
console.log(`Mural: ${photos.length} foto(s) encontrada(s) em public/images/mural/.`);
