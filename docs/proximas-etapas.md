# Decisões de produto — 12/10/2026

## Conquistas e diários implementados — 13/10/2026

Cada concessão registra campanha, jogador e personagem(s) que a receberam. O jogador mantém a conquista entre campanhas; personagens novos não a herdam. Ganhar novamente em outra campanha concede a conquista ao personagem participante e acrescenta uma estrela ao jogador, com máximo de três estrelas. Contar campanhas distintas, sem aumentar estrelas por repetir na mesma campanha. Preservar o histórico mesmo após atingir três estrelas.

Concessões antigas devem conservar suas datas e jogadores. Não atribuir retroativamente uma conquista a um personagem específico sem evidência; manter concessão legada até revisão do autor.

O diário pertence a cada personagem e possui entradas com título, data do universo e texto. No editor, selecione DIÁRIOS, escolha o personagem, preencha a entrada e aplique ao rascunho. Entradas existentes podem ser editadas ou removidas. Na página do personagem, a aba DIÁRIO apresenta somente as entradas recolhidas para leitura. O campo de anotação local foi removido para evitar confusão com o cadastro de entradas; dados antigos no armazenamento do navegador não foram apagados.

Em CONQUISTAS, selecione a conquista, marque o jogador e os personagens participantes, preencha a data e aplique ao rascunho. As estrelas do jogador contam campanhas distintas, até três; o histórico completo permanece disponível. Concessões antigas continuam sem personagem até revisão manual. Confira o rascunho antes de salvar os arquivos locais. Salvar localmente não publica no GitHub.

## Publicação e edição

O editor atual roda somente em 127.0.0.1:3841, com verificações de origem e endereço local para gravações. O build público não inclui as rotas de edição. A importação de retratos usa a mesma restrição local.

Fluxo previsto: editar localmente, salvar com backup, revisar mudanças, enviar ao GitHub e publicar o build estático. O domínio próprio pode apontar para essa hospedagem sem expor o editor. Acesso remoto para jogadores escreverem diários exigirá autenticação e autorização por personagem em uma etapa própria. Nenhum serviço remoto ou conta pública de edição foi habilitado.

## Ajustes concluídos nesta revisão

- Contornos da UPP reconectados; pequenas manchas amarelas espúrias removidas. Limites continuam aproximações da referência.
- Domínios são compostos sem acumular a cor da Fronteira ou de governos abaixo; áreas locais substituem visualmente o domínio na área delimitada.
- Controles compactos e camadas sobre o canvas; cartões de vértices e seleção de território mais compactos.
- Botão para posicionar sistema no mapa, inclusive ao cadastrar sistema pela missão.
- Data de partida nomeada explicitamente; registros de sessão recebem data/equipe da missão e permanecem editáveis.
- Importação de retratos para recursos locais, com conversão e redução no navegador, limite de tamanho e nome gerado no servidor local.

Verificação: 37 testes aprovados, build concluído e fluxos de preenchimento/importação verificados no navegador. Retrato de teste removido após validação.


### Criador de mapas — validação pendente

Antes de encerrar o bloco de módulos, seguir [a checklist de validação visual](validacao-pendente-blueprints.md). Conferência adiada pelo usuário em 23/10/2026; desenvolvimento local autorizado a continuar. Próxima frente: anotações e medidas do mapa.
