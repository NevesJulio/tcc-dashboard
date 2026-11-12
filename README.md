# ECG Lab · TCC Research Dashboard

Aplicação estática em português para acompanhar pesquisa em representações discretas de ECG com VQ-VAE e Transformers. React, TypeScript, Vite, Tailwind CSS e Lucide. Sem backend, autenticação ou serviços de dados.

## Executar

Requer Node.js 22 e npm.

```bash
npm ci
npm run dev
```

Abra o endereço mostrado pelo Vite, incluindo `/tcc-dashboard/`. Para verificar a versão de produção:

```bash
npm test
npm run build
npm run preview
```

## Funcionalidades

- Visão geral com marcos sugeridos, tarefas e candidatos.
- Diretório de oito pesquisadores: busca, filtros por país e área, ordenação por afinidade editorial ou nome, favoritos, perfil e notas.
- Comparação de dois a quatro pesquisadores.
- Documentos configuráveis, registros ilustrativos de experimentos, tarefas com status editável e introdução técnica com pipeline visual.
- Tema claro/escuro persistente e navegação responsiva acessível.
- Exportação e importação conjunta de avaliações e tarefas em JSON, com validação e confirmação antes de substituir dados.

## Editar conteúdo

- `src/data/researchers.ts`: todos os perfis, áreas, links e pontuação editorial para ordenação. Informações fornecidas pelo autor, sem verificação independente. Confirme afiliações e a relação indicada com vq-wav2vec antes de usar esses dados formalmente. Cidades não verificadas ficam como “A confirmar”. As fotos fornecidas pelo autor ficam em `public/images/researchers/`. O campo opcional `image` contém o caminho relativo (por exemplo, `images/researchers/Steffen-Schneider.jpeg`), sem `public/` e sem barra inicial. O componente considera automaticamente o caminho do GitHub Pages. Se a foto estiver ausente ou falhar, mostra as iniciais. Para trocar uma foto, substitua o arquivo ou atualize esse campo.
- `src/data/project.ts`: título, autor, orientador, documentos, tarefas iniciais e experimentos. Substitua `url: null` por URLs reais. Documentos sem endereço não geram links quebrados.
- Experimentos são exemplos de planejamento, sem métricas fabricadas. Substitua ou estenda os registros e seus tipos para incluir resultados reais.
- `src/types/index.ts`: contratos de dados.
- `src/styles/index.css`: design, responsividade e temas.
- `src/components/`: cartões e modal reutilizáveis.

Os status iniciais e o estado do projeto são sugestões a confirmar. O painel não contém prazos ou atualizações científicas inventados. Para ocultar conteúdo público, remova entradas nos arquivos de dados e revise a página correspondente antes de publicar.

## Dados locais e compartilhamento

Favoritos, notas, tarefas e tema são armazenados em `localStorage`, por navegador e origem. Não são sincronizados com o orientador. Limpar os dados do navegador remove esse estado. Exporte regularmente pelo botão **Exportar JSON** nas páginas de banca e cronograma.

Para trocar avaliações, envie o arquivo exportado manualmente. O destinatário escolhe **Importar**, revisa a confirmação e pode exportar seus dados atuais antes de substituí-los. A importação substitui avaliações e status; não faz mesclagem. Aceita versão 1 e arquivos de até 1 MB. Não edite IDs de pesquisadores ou tarefas em arquivos de intercâmbio. Mudanças nas tarefas iniciais não sobrescrevem automaticamente o estado já salvo no navegador; ajuste a migração se alterar o esquema.

O site será público. Não inclua dados confidenciais, credenciais, registros de pacientes ou conteúdo privado no código ou nos arquivos compartilhados. Links para Google Docs não concedem acesso e o painel não incorpora seu conteúdo.

## Publicar no GitHub Pages

1. Crie o repositório `nevesjulio/tcc-dashboard` e envie estes arquivos para a branch `main`, incluindo `package-lock.json`.
2. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` executa instalação, testes e build, e publica o artefato de `dist/` em cada push para `main`. Também pode ser iniciado manualmente em Actions.
4. Após a execução, a URL esperada é `https://nevesjulio.github.io/tcc-dashboard/`.

Não são necessários secrets ou variáveis de ambiente. O `base` do Vite é `/tcc-dashboard/`; altere `vite.config.ts` se mudar o nome do repositório. A navegação usa fragmentos (`#/committee`), permitindo abrir links internos e recarregar páginas no GitHub Pages sem configurar fallback de servidor.

Publicação não é executada automaticamente pelo ambiente local: é necessário enviar os arquivos ao repositório e ativar Pages.

## Mural de fotos

O mural, a apresentação e o slide PNG mostram **somente fotos**, sem títulos, legendas visíveis, frases, bordas ou espaços. A composição preenche a área 16:9, inclusive a última linha. As imagens são recortadas ao centro para preencher suas células. **Apresentar** oculta o painel; Esc sai. **Baixar slide PNG** gera um arquivo 1920 × 1080.

### Publicar fotos a cada push

1. Coloque os arquivos JPG, JPEG, PNG ou WebP em `public/images/mural/` (subpastas também são aceitas).
2. Para definir a ordem sem configuração adicional, use nomes como `01-familia.jpg`, `02-amigos.jpg`.
3. Faça commit e push normalmente:

```bash
git add .
git commit -m "Atualiza fotos do mural"
git push
```

O build descobre as imagens automaticamente e as inclui no site. **Não é necessário cadastrar cada foto em TypeScript.** Para remover uma foto publicada, retire o arquivo da pasta e faça outro commit/push. Depois de alterar a pasta durante o desenvolvimento, reinicie `npm run dev` para regenerar a lista. O manifesto `src/data/muralPhotos.generated.json` é gerado antes de dev/build/test e não deve ser editado ou versionado. O workflow existente já executa esse processo com `npm run build`.

### Levar as fotos do navegador ao projeto

**Adicionar fotos locais** cria rascunhos no navegador, sem acesso ao seu Git ou ao disco do projeto. Para publicá-los:

1. Na página, clique em **Backup do mural**.
2. No terminal da pasta do projeto, execute:

```bash
npm run mural:import -- "/caminho/para/ecglab-mural-backup.json"
```

3. Faça commit e push como acima.

O comando extrai as fotos do backup para `public/images/mural/` e registra sua ordem em `photos.json`. Não apaga arquivos já existentes. Reimportar o mesmo backup reutiliza os mesmos arquivos. Essas fotos passam a ser públicas após o push/deploy. Fotografias já publicadas não ficam duplicadas nos rascunhos importados desse mesmo backup. Novas imagens publicadas são incorporadas mesmo quando há um mural local salvo; fotos de arquivos removidos do projeto deixam de aparecer após o deploy, exceto cópias independentes salvas como rascunho.

As fotos locais são reduzidas para até 1.600 px, salvas em IndexedDB e ficam disponíveis no mesmo navegador, perfil e endereço. **Backup do mural** guarda as imagens e a ordem. **Restaurar backup** valida e pede confirmação antes de substituir a cópia local. Backups antigos continuam aceitos, mas suas frases e legendas não aparecem no mural. Limpar os dados do navegador remove os rascunhos. O backup do mural é independente das avaliações da banca.
