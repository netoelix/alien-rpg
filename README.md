# Alien RPG — versão 3

Arquivo público de campanhas com interface inspirada nos terminais de Alien. Esta versão integra o protótipo aprovado e os registros de **Fragmentos da Guerra** ao repositório original.

## Executar

Requer Node.js 22.12 ou superior. A interface usa React e o build usa Vite. Instale as dependências antes de executar:

```sh
npm ci
```

```sh
npm run dev
```

Abra http://127.0.0.1:3841. Para validar e gerar o site estático:

```sh
npm run check
npm test
npm run build
npm run preview
```

O resultado fica em `dist/`. A configuração do Vercel usa essa pasta. Os antigos endereços `/about`, `/players` e `/timeline` direcionam para as respectivas áreas da nova interface.

## Conteúdo e estrutura

- `data/fragmentos-da-guerra.json`: jogadores, conquistas e logs migrados.
- `data/schema.js`: relações e validação dos dados.
- `src/App.jsx`: estrutura da aplicação e navegação.
- `src/pages/`: páginas em React, separadas por assunto.
- `src/components/`: elementos compartilhados.
- `src/lib/narrative.js`: interpretação das tarjas e dos parágrafos.
- `style.css`: identidade visual e comportamento responsivo.
- `public/assets/`: fontes, retratos, medalhas e imagem do mapa utilizados.
- `tests/`: validação da migração e das relações.
- `docs/migration-notes.txt`: correções aplicadas na migração.

As datas das missões pertencem à cronologia fictícia. As tarjas são efeitos narrativos reveláveis. O mapa apresenta posições e rotas ilustrativas, sem afirmar coordenadas oficiais.

## Limites desta primeira integração

O seletor apresenta uma campanha migrada. O cadastro de novas campanhas e o editor administrativo ainda precisam ser implementados. Não há autenticação, banco de dados ou serviço remoto de escrita.

O diário guarda rascunhos apenas no navegador e permite baixar o texto; não publica registros nem sincroniza dispositivos. As conquistas continuam sendo as concessões do acervo original: níveis por repetição e conquistas próprias de personagens são etapas futuras.

As relações entre personagens e logs são inferidas por nomes mencionados no texto ou no esquadrão. Menção não significa participação. Os identificadores de páginas ainda dependem da ordem dos registros: não reordene jogadores ou personagens sem uma migração para identificadores permanentes.

## Publicação e revisão

A branch `alien-rpg-3.0` prepara a substituição da interface anterior. O merge para `alien-rpg-page` deve acontecer somente após revisão. Nenhum servidor pago é necessário para leitura do site; a edição e publicação seguras serão desenvolvidas separadamente.

Desenvolvido por Elix Merlino Neto. Créditos das medalhas: André Luiz Brandão. Projeto de fãs para acompanhamento de RPG.

## Convenções de edição

O código-fonte permanece formatado para leitura humana; apenas os arquivos gerados em `dist/` são compactados. Execute `npm run format` após editar e `npm run check` para conferir a formatação. Os dados continuam separados em JSON, e o React escapa textos ao renderizá-los, sem inserir HTML dos relatos.

No celular, biografias longas podem ser expandidas e recolhidas. No desktop, o retrato acompanha a rolagem. Logs usam texto justificado, e o botão de revelação só aparece quando o relato contém trechos entre barras, como `/informação sensível/`. Datas numéricas não são interpretadas como censura.
