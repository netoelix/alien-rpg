# Editar, salvar e publicar

## O que cada botão faz

| Ação | Resultado |
| --- | --- |
| Aplicar ao rascunho | Atualiza a versão de trabalho dentro do editor. Ainda não grava o projeto. |
| Conferir site | Abre uma cópia do rascunho para leitura. Abra novamente após outras alterações. |
| Salvar arquivos com backup | Grava `data/archive.json` no projeto e copia a versão anterior para `.editor-backups/`. |
| Exportar backup | Baixa o conteúdo do rascunho em JSON. Imagens não estão incluídas. |

O site público só muda quando uma nova versão é enviada à hospedagem. Não é necessário copiar cada texto para o GitHub: o editor já organiza tudo no arquivo do projeto.

## Rotina de edição

1. Na pasta do projeto, execute `npm run editor` e mantenha o terminal aberto.
2. Acesse `http://127.0.0.1:3841/#/editor`.
3. Edite, aplique ao rascunho e confira a prévia.
4. Salve os arquivos com backup.
5. Execute `npm run verify` em outro terminal. Ele confere a formatação, executa os testes e gera `dist/`. Se uma etapa falhar, as seguintes não são executadas.

Diários são cadastrados no editor. A página do personagem serve apenas para leitura. A importação de um retrato grava uma imagem em `public/assets/`; inclua essa imagem junto com os dados ao enviar alterações.

Se aparecer “Port 3841 is already in use”, use o editor já aberto ou encerre o terminal anterior com Ctrl+C antes de iniciar outro. A porta do editor é fixa por causa das verificações de origem.

## Enviar ao GitHub

A primeira publicação da versão 3 precisa incluir todo o código novo e passar pela revisão da branch `alien-rpg-3.0` antes da integração em `alien-rpg-page`.

Depois dessa integração, uma atualização apenas de conteúdo normalmente altera `data/archive.json` e, se houver retratos importados, `public/assets/`. Confira os arquivos modificados, crie um commit e envie a branch ao GitHub. Essa etapa pode ser feita por uma interface Git ou pelo terminal; editar arquivos no VS Code não é necessário.

O envio ao GitHub só atualiza o site automaticamente se a hospedagem estiver conectada ao repositório e à branch correta. A configuração dessa conexão e a escolha da hospedagem ainda precisam ser confirmadas. A validação do GitHub Actions deste projeto executa verificações; ela não é uma rotina de publicação.

Para hospedagem de arquivos estáticos, o resultado a publicar é a pasta `dist/` gerada por `npm run verify`. Não envie a pasta inteira do projeto como site público. O build público não inclui o editor local nem sua API de gravação.

## Recuperar conteúdo

No editor, use Importar backup, selecione um JSON exportado ou um arquivo de `.editor-backups/`, confira o rascunho e salve. O backup JSON recupera textos e referências às imagens, mas não os arquivos das imagens. Mantenha também uma cópia de `public/assets/`. Backups automáticos ficam fora do Git e não substituem uma cópia em outro local.

## Pendências para a primeira publicação

- Concluir a revisão visual do mapa e dos formulários em celular.
- Revisar o conjunto de alterações da versão 3.
- Confirmar hospedagem e branch de publicação.
- Integrar a versão aprovada e conferir o endereço público.

Este guia não executa commit, push, merge ou publicação.
