# Verificação de diários e conquistas — 13/10/2026

Fluxo esperado: editor local → aplicar ao rascunho → conferir página pública → salvar com backup → reabrir o acervo.

## Evidências automatizadas

- 41 testes aprovados; build público concluído.
- Diário preserva título, data e parágrafos no modelo e após salvar/reabrir pelo armazenamento do editor.
- Entradas incompletas e identificadores repetidos são rejeitados.
- Uma conquista em quatro campanhas mantém quatro ocorrências e exibe no máximo três estrelas.
- Dois personagens do mesmo jogador na mesma campanha recebem o feito sem adicionar outra estrela.
- Personagens de outro jogador, concessões duplicadas e novas concessões sem personagem são rejeitados.
- Concessões antigas preservam jogador e data, sem atribuição automática a personagem.
- Testes existentes confirmam preservação dos relatos migrados, isolamento entre campanhas, backups e recusa de gravações com revisão desatualizada.

## Verificação no navegador concluída parcialmente

Depois de encerrar o servidor iniciado pelo agente e usar o servidor aberto pelo usuário, o navegador conseguiu conectar. Foram verificados: criação e edição de entrada, abertura da prévia, expansão para leitura, remoção do rascunho, concessão a personagem e exibição no personagem e no jogador com uma estrela. Não foram gravados dados de teste no arquivo real.

O diário foi conferido em 390 × 844 e 1366 × 900, sem transbordamento horizontal na página. A leitura revelou que as quebras de linha eram juntadas; o CSS do diário agora preserva essas quebras. O status geral do editor também foi corrigido para indicar a aplicação do diário ao rascunho. Nenhum erro de console foi encontrado na prévia verificada.

Evidências: `outputs/diario-mobile.png` e `outputs/diario-desktop.png` na pasta de trabalho acima do repositório. As capturas contêm uma entrada temporária de verificação.

Ainda não executados pela interface nesta revisão (as regras de persistência e progressão têm testes automatizados):

1. Repetir a conquista em outra campanha e conferir duas estrelas no jogador, sem herança por personagens não selecionados.
2. Salvar e recarregar usando uma cópia de teste, confirmando o backup e os dados reabertos.
3. Ampliar a revisão responsiva para todos os formulários e o mapa.

Nenhum dado fictício de teste foi gravado no acervo real. Nenhum push, merge ou publicação foi realizado.
