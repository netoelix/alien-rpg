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

- `data/archive.json`: campanhas, jogadores, personagens, conquistas e logs.
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

O seletor aceita várias campanhas e o editor local permite criar e editar o acervo. A gravação existe somente ao executar o modo editor na sua máquina. Não há autenticação remota, banco de dados ou serviço público de escrita.

O diário guarda rascunhos apenas no navegador e permite baixar o texto; não publica registros nem sincroniza dispositivos. As conquistas continuam sendo as concessões do acervo original: níveis por repetição e conquistas próprias de personagens são etapas futuras.

As relações entre personagens e logs são inferidas por nomes mencionados no texto ou no esquadrão. Menção não significa participação. Campanhas e personagens possuem identificadores permanentes. Os links de jogadores e missões ainda usam a posição dos registros: preserve a ordem ao importar backups. O editor adiciona novos jogadores e missões ao final.

## Publicação e revisão

A branch `alien-rpg-3.0` prepara a substituição da interface anterior. O merge para `alien-rpg-page` deve acontecer somente após revisão. Nenhum servidor pago é necessário para leitura do site; a publicação é uma etapa separada da edição local.

Desenvolvido por Elix Merlino Neto. Créditos das medalhas: André Luiz Brandão. Projeto de fãs para acompanhamento de RPG.

## Convenções de edição

O código-fonte permanece formatado para leitura humana; apenas os arquivos gerados em `dist/` são compactados. Execute `npm run format` após editar e `npm run check` para conferir a formatação. Os dados continuam separados em JSON, e o React escapa textos ao renderizá-los, sem inserir HTML dos relatos.

No celular, biografias longas podem ser expandidas e recolhidas. No desktop, o retrato acompanha a rolagem. Logs usam texto justificado, e o botão de revelação só aparece quando o relato contém trechos entre barras, como `/informação sensível/`. Datas numéricas não são interpretadas como censura.

## Editor local

```sh
npm run editor
```

Abra http://127.0.0.1:3841/#/editor. O modo usa a mesma porta da prévia: encerre outro processo do site antes de iniciá-lo. Acesse exatamente 127.0.0.1, e não localhost.

1. Selecione ou crie uma campanha.
2. Edite a apresentação, jogadores, personagens, missões e conquistas pelos formulários.
3. Clique em **Aplicar ao rascunho** para cada registro.
4. Clique em **Salvar arquivos com backup** para gravar `data/archive.json`.
5. Abra **Conferir site** em outra aba. Recarregue a prévia depois de uma nova gravação.
6. Para publicar, gere o site e envie os arquivos pela sua rotina de publicação. Salvar no editor não publica no GitHub nem na hospedagem.

A API de gravação só é montada nesse modo, escuta em loopback e exige a origem local na gravação. O build público exclui o editor. Antes de gravar, o conteúdo passa por validação e a versão anterior é copiada para `.editor-backups/` (fora do Git). Uma edição antiga é recusada se o arquivo mudou em disco. Uma falha na criação do backup interrompe a gravação.

**Exportar backup** baixa o rascunho inteiro. **Importar backup** carrega um arquivo JSON validado como rascunho, sem gravar imediatamente. Para restaurar uma cópia automática, escolha um arquivo de `.editor-backups/`, confira e salve. Os rascunhos de formulários e do acervo são recuperados na mesma sessão do navegador, quando a revisão em disco permanece igual. Eles não substituem os backups em arquivo.

Nesta etapa, os retratos e medalhas são escolhidos entre os recursos já presentes em `public/assets/`. Upload de imagens, exclusão de registros, níveis de conquistas e publicação automática ainda não estão disponíveis. Jogadores e concessões são cadastrados por campanha; uma identidade global de jogador entre campanhas será implementada antes da progressão compartilhada. O editor local não permite que outras pessoas editem remotamente.

## Campos obrigatórios e opcionais

- Campanha: nome opcional (nome automático Campanha 2, Campanha 3 etc.); resumo, apresentação, período, unidade, divisão e créditos opcionais. Estado inicia como Planejada e pode ser alterado.
- Jogador: nome obrigatório.
- Personagem: nome, profissão, biografia, jogador e retrato obrigatórios. Codinome, nomes usados nos logs e situação são opcionais. Situação aceita Vivo, Morto ou Desaparecido e só aparece quando informada. O acervo existente não recebe situações automaticamente.
- Missão: nome, sistema/localização, data fictícia, equipe e relato obrigatórios.
- Conquista: nome, descrição, medalha, categoria e grau obrigatórios. Concessões são opcionais; cada concessão selecionada exige data válida.

O formulário identifica os campos e mostra mensagens de validação ao aplicar. Um nome de campanha vazio recebe automaticamente um nome numerado, que continua editável.
