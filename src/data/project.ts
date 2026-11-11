import type {DocumentLink,Task} from '../types';
export const project = {title:'Representações discretas de sinais de ECG',subtitle:'Aprendizado de representações com VQ-VAE e Transformers para classificação multirrótulo de eletrocardiogramas.',author:'Júlio Neves',advisor:'Prof. Ricardo Alexsandro de Medeiros Valentim',institution:'Universidade Federal do Rio Grande do Norte',status:'Em desenvolvimento · a confirmar'};
export const documents:DocumentLink[] = [
{title:'Manuscrito do TCC',category:'Escrita',description:'Texto principal da pesquisa no Google Docs.',url:null},
{title:'Artigos de referência',category:'Bibliografia',description:'Leituras sobre VQ-VAE, ECG e Transformers.',url:null},
{title:'Repositório da pesquisa',category:'Código',description:'Código dos modelos e processamento de dados.',url:null},
{title:'Resultados experimentais',category:'Experimentos',description:'Métricas, figuras e registros dos experimentos.',url:null},
{title:'Apresentação da defesa',category:'Apresentações',description:'Slides e materiais de apresentação.',url:null},
{title:'Material suplementar',category:'Bibliografia',description:'Referências, protocolos e documentação adicional.',url:null}
];
export const initialTasks:Task[] = [
{id:'review',title:'Consolidar revisão bibliográfica',category:'Pesquisa',status:'Em andamento'},
{id:'data',title:'Definir base de ECG e protocolo de avaliação',category:'Experimentos',status:'A fazer'},
{id:'vqvae',title:'Implementar baseline VQ-VAE',category:'Experimentos',status:'A fazer'},
{id:'writing',title:'Escrever fundamentação teórica',category:'Escrita',status:'A fazer'},
{id:'committee',title:'Avaliar candidatos à banca',category:'Banca',status:'Em andamento'},
{id:'defense',title:'Preparar roteiro da defesa',category:'Defesa',status:'A fazer'}
];
export const experiments = [
{id:'EXP-001',name:'Reconstrução com VQ-VAE',model:'VQ-VAE',description:'Comparar reconstrução e utilização do codebook.',config:'Codebook: 128 / 256 / 512 · dimensão: 64',metrics:'MSE · MAE · perplexidade'},
{id:'EXP-002',name:'Classificação de tokens de ECG',model:'Transformer',description:'Investigar classificação multirrótulo a partir dos tokens.',config:'Camadas: 4 / 6 · atenção: 4 cabeças',metrics:'AUROC · AUPRC · macro F1'},
{id:'EXP-003',name:'Ablação do vocabulário',model:'Estudo de ablação',description:'Avaliar efeito do tamanho do vocabulário e comparar modelos.',config:'Variar codebook mantendo o protocolo de avaliação',metrics:'Reconstrução · classificação · custo'}
];
