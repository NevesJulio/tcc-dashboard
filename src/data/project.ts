import type {DocumentLink,Task} from '../types';
export const project = {title:'Representações discretas de sinais de ECG',subtitle:'Tokenização de eletrocardiogramas com VQ-VAE e Transformers para investigar classificação, geração de laudos e síntese de ECG a partir de texto.',author:'Júlio Neves',advisor:'Prof. Ricardo Alexsandro de Medeiros Valentim',institution:'Universidade Federal do Rio Grande do Norte',status:'Em desenvolvimento · a confirmar'};
export const documents:DocumentLink[] = [
{title:'Manuscrito do TCC',category:'Escrita',description:'Texto principal da pesquisa no Google Docs.',url: "https://docs.google.com/document/d/1qVVR9nwBiDmsZ6LBw7mKKl1xCG6LXeFD4vWkl6YfAxA/edit?tab=t.0"},
{title:'Artigos de referência',category:'Bibliografia',description:'Leituras sobre VQ-VAE, ECG e Transformers.',url:null},
{title:'Repositório da pesquisa',category:'Código',description:'Código dos modelos e processamento de dados.',url:'https://github.com/NevesJulio/VQ-VAE-ECG'},
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
{id:'VQ-32',name:'Tokenização da derivação II · compressão 32×',model:'VQ-VAE EMA',description:'Configuração para aprender tokens da derivação II e avaliar a reconstrução do sinal.',config:'512 códigos · embedding 64 · 5 camadas de redução',metrics:'MSE · correlação · utilização do codebook',file:'configs/experiments/vqvae-single-lead-ii-x32.yaml'},
{id:'GEN-10',name:'Texto e ECG em janelas de 10 segundos',model:'Transformer · derivação II',description:'Investigar geração com janelas aleatórias de tokens de ECG e contexto textual.',config:'157 tokens ECG · 4 camadas · 4 cabeças · dimensão 128',metrics:'Loss de validação · qualidade do sinal gerado',file:'configs/experiments/single-lead-transformer-random-windows-10s.yaml'},
{id:'TXT-10',name:'Geração de laudos a partir do ECG',model:'Transformer · ECG → texto',description:'Configuração dedicada à direção ECG para texto, com avaliação dos diagnósticos presentes nos laudos.',config:'Janelas de 10 s · até 96 tokens de texto',metrics:'F1 macro e micro · métricas por diagnóstico',file:'configs/experiments/single-lead-transformer-ecg-to-text-10s.yaml'},
{id:'ANC-10',name:'Geração de múltiplas derivações com âncora',model:'Transformer · atenção cruzada',description:'Investigar a geração condicionada por uma derivação âncora e o uso gradual de âncoras sintéticas.',config:'157 tokens por janela · 4 camadas · 4 cabeças',metrics:'Coerência entre derivações · qualidade da geração',file:'configs/experiments/anchor-cross-attention-10s.yaml'}
];
