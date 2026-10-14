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

O editor permite registrar páginas de diário por personagem, com título, data do universo e texto. A aba Diário na página do personagem serve somente para leitura dessas entradas. Jogadores possuem cadastro universal e conquistas compartilhadas entre campanhas: cada campanha distinta soma uma estrela, até três. Os personagens recebem apenas conquistas explicitamente atribuídas a eles. Concessões antigas conservam o jogador e a data, sem inventar um personagem destinatário.

As relações entre personagens e logs são inferidas por nomes mencionados no texto ou no esquadrão. Menção não significa participação. Campanhas e personagens possuem identificadores permanentes. Os links de jogadores e missões ainda usam a posição dos registros: preserve a ordem ao importar backups. O editor adiciona novos jogadores e missões ao final.

## Publicação e revisão

O passo a passo está em [Editar, salvar e publicar](docs/editar-e-publicar.md). Execute `npm run verify` para conferir formatação, testes e build em uma única sequência; esse comando não envia nem publica arquivos.

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
2. Edite a apresentação, jogadores, personagens, missões, registros de sessão, diários e conquistas pelos formulários.
3. Clique em **Aplicar ao rascunho** para cada registro.
4. Abra **Conferir site** em outra aba para revisar o rascunho. Abra novamente após aplicar outras alterações.
5. Clique em **Salvar arquivos com backup** para gravar `data/archive.json`.
6. Para publicar, gere o site e envie os arquivos pela sua rotina de publicação. Salvar no editor não publica no GitHub nem na hospedagem.

A API de gravação só é montada nesse modo, escuta em loopback e exige a origem local na gravação. O build público exclui o editor. Antes de gravar, o conteúdo passa por validação e a versão anterior é copiada para `.editor-backups/` (fora do Git). Uma edição antiga é recusada se o arquivo mudou em disco. Uma falha na criação do backup interrompe a gravação.

**Exportar backup** baixa o rascunho inteiro. **Importar backup** carrega um arquivo JSON validado como rascunho, sem gravar imediatamente. Para restaurar uma cópia automática, escolha um arquivo de `.editor-backups/`, confira e salve. Os rascunhos de formulários e do acervo são recuperados na mesma sessão do navegador, quando a revisão em disco permanece igual. Eles não substituem os backups em arquivo.

Retratos podem ser importados pelo formulário do personagem e são armazenados em `public/assets/`; medalhas são selecionadas entre os recursos existentes. O backup JSON não contém as imagens: preserve também a pasta de recursos. A publicação automática pelo editor ainda não está disponível. O editor local não permite que outras pessoas editem remotamente.

### Exclusão e restauração

Selecione um registro existente para enviá-lo à **Lixeira**. A confirmação explica os vínculos afetados; formulários ainda não aplicados da campanha são descartados. Confira o rascunho e use **Salvar arquivos com backup** para persistir a exclusão ou restauração. A publicação continua sendo uma etapa separada.

- Campanhas levam seus registros para a lixeira; mantenha ao menos uma campanha ativa.
- Remover uma participação afeta somente aquela campanha e seus personagens. O cadastro universal do jogador permanece. Na Lixeira, cadastros globais sem participação ativa podem ser removidos separadamente.
- Excluir um personagem inclui seu diário, mas preserva os feitos do jogador. Excluir uma missão inclui seus relatos e paradas vinculadas; os índices das outras paradas são ajustados.
- Excluir uma conquista universal remove também suas concessões em todas as campanhas. A restauração recupera os vínculos originais.
- Registros de sessão e entradas de diário podem ser removidos individualmente.

A Lixeira persiste no JSON e nos backups, mas é excluída do pacote do site público. Não é armazenamento confidencial: o arquivo-fonte continua no repositório. A restauração preserva edições independentes e recusa conflitos nos mesmos registros; quando necessário, restaure primeiro a campanha ou personagem ao qual o item pertence. Não há descarte definitivo pela interface.

### Missões e mapa

O nome do sistema nos cartões, detalhes e relatos da missão abre o mapa centralizado no sistema e com o percurso selecionado naquela visita. Retornos ao mesmo sistema mantêm etapas distintas. Uma localização sem parada registrada abre somente o sistema, sem inventar uma viagem. Os links das paradas usam identificadores estáveis, inclusive quando uma missão anterior é excluída.

## Campos obrigatórios e opcionais

- Campanha: nome opcional (nome automático Campanha 2, Campanha 3 etc.); resumo, apresentação, período, unidade, divisão e créditos opcionais. Estado inicia como Planejada e pode ser alterado.
- Jogador: nome obrigatório.
- Personagem: nome, profissão, biografia, jogador e retrato obrigatórios. Codinome, nomes usados nos logs e situação são opcionais. Situação aceita Vivo, Morto ou Desaparecido e só aparece quando informada. O acervo existente não recebe situações automaticamente.
- Missão: nome, sistema/localização, data fictícia e equipe. Relatos são cadastrados separadamente em registros de sessão.
- Diário: personagem, título, data fictícia e texto obrigatórios.
- Conquista: nome, descrição, medalha, categoria e grau obrigatórios. Concessões são opcionais; novas concessões exigem data válida e personagens pertencentes ao jogador selecionado.

O formulário identifica os campos e mostra mensagens de validação ao aplicar. Um nome de campanha vazio recebe automaticamente um nome numerado, que continua editável.

A cartografia e seu editor estão descritos em [docs/mapa.md](docs/mapa.md): catálogo com 278 pontos, sistemas vinculados às missões, territórios com áreas separadas e percurso completo de Fragmentos da Guerra. A imagem de referência não integra a publicação.
