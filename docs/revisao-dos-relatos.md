# Revisão editorial dos relatos de Fragmentos da Guerra

Revisão de 14/10/2026. Foram lidos os 17 registros atuais em `data/archive.json`, incluindo os marcadores de registros indisponíveis. A avaliação abaixo registra o diagnóstico anterior à revisão autorizada pelo autor.

## Revisão aplicada

- Horários confirmados pelo autor: registro 07, `24:30` corrigido para `00:30`; registro 10, organização do salão corrigida de `09:00` para `09:30`, após a chegada às `09:15`.
- Pontuação, concordância evidente, espaços e parágrafos por cena revisados em 13 relatos. Os quatro registros de indisponibilidade foram preservados.
- A barra sem par em Blackout foi completada antes de “Trisha e Sean compartilharam novamente um sonho conjunto”, preservando a censura desse acontecimento e dos trechos seguintes.
- O leitor agora reconhece parágrafos explícitos e horários, inclusive dentro das tarjas, sem expor o conteúdo censurado. Testes cobrem quebras internas e datas com barras.
- Textos longos de missões, biografias, diários, resumos e apresentações de campanha recebem justificação, com a última linha alinhada ao início e hifenização automática. Rótulos, títulos, botões e descrições curtas de conquistas permanecem com o alinhamento anterior.
- Nenhum registro foi dividido em sessões novas. Datas, equipes, IDs e sistemas principais das missões foram preservados. Grafias e patentes ambíguas continuam pendentes, sem correções por suposição.
- `data/mission-editorial-review.json` guarda os textos anteriores e a assinatura de cada revisão; os testes continuam conferindo os originais contra as assinaturas da migração, sem sobrescrevê-las.

A revisão dos sistemas mencionados e das paradas está em `docs/revisao-do-percurso.md`.

## Recomendação

Manter os 17 registros históricos. Melhorar parágrafos, pontuação e divisões por cena dentro de cada relato, principalmente em Operação Phantom (parte 2), Operação Ponto Final e Invasão secreta. O tamanho de um texto, sozinho, não justifica criar uma nova sessão: o acervo não informa onde terminaram as sessões reais.

Para novos relatos, usar a estrutura já disponível de vários registros por missão: um registro por sessão, com título e data do universo próprios. Uma sessão pode abranger vários dias fictícios; não converter cada horário ou mudança de dia em uma sessão.

Separar os textos em arquivos físicos não melhora a leitura no site e exigiria adaptar o editor, a importação, os backups e a validação do acervo. O JSON atual continua adequado para este volume. Não alterar a persistência apenas por motivos editoriais.

## Avaliação por registro

| Registro | Proposta |
| --- | --- |
| 01 — Sobreviva a guerra | Manter um relato. Os horários organizam bem a fuga. Revisar vírgulas usadas entre frases completas, maiúsculas depois de vírgulas e `algo?.`. |
| 02 — Sobreviva ao ataque bioquímico | Manter um relato. Destacar “DOIS DIAS DEPOIS” em parágrafo próprio; revisar pontuação sem mudar a abrangência das tarjas. |
| 03 — Transporte de suprimentos | Manter. Uniformizar a voz narrativa: alterna “os jogadores”, “os personagens”, “a tripulação” e “Conseguimos”. Preferir a voz de relatório da companhia, após definir o narrador. |
| 04 — Transporte de suprimentos (parte 2) | Manter separado do anterior: tem outra data e outro sistema. Conferir “Harper manteve-se próxima” e “classe Costenoga”; não corrigir nomes de universo por suposição. |
| 05 — Operação Phantom | Manter o registro; organizar em preparação, Owl Marsh, Bakers Quarter e extração/debriefing. Revisar “O grupo foi recebida”. A passagem de 20:17 para 03:00 precisa de indicação de dia, se confirmada. |
| 06 — Operação Phantom (parte 2) | Maior candidato a divisões internas: julgamento/viagem, busca, caverna, extração e sonhos. Há muitos horários dentro de tarjas, prejudicando a separação atual em parágrafos. Preservar a discrepância temporal da caverna: o próprio relato a apresenta como fenômeno narrativo. |
| 07 — Resgate de pessoal autorizado | Manter. Confirmar `24:30`: pode ser duração ou intenção de registrar `00:30` do dia seguinte. O trecho “Durante uma batalha em outro sistema antes do major vir ao resgate” é retrospectivo e merece ser apresentado como informe recebido, se essa interpretação estiver correta. |
| 08 — Operação Blackout | Manter; divisões por preparação, Tlenjos, Lusprel e retorno. Há uma barra aparentemente sem par em “sonho conjunto/. /Eles…”, que pode deslocar a interpretação das censuras. Confirmar o trecho que deveria estar censurado antes de reparar. |
| 09 — Operação Checkout | Preservar `CORROMPIDO`, um efeito narrativo deliberado. |
| 10 — Operação Ponto Final | Dividir visualmente por etapas da infiltração e evacuação. Confirmar a sequência `09:15 → 09:00` e as mudanças de dia. Corrigir o espaço ausente em `ali.01:00`. Há trechos longos que podem receber parágrafos sem criar novas sessões. |
| 11 — Invasão secreta | Maior prioridade editorial: texto extenso sem horários ou parágrafos suficientes. Separar descanso, sabotagem, batalha, evacuação, travessia, tentativa de resgate e catástrofe. Corrigir espaços em `nave.O grupo` e `seguir.A tempestade`. Destacar desaparecidos e mortos; manter exatamente os respectivos estados e nomes. |
| 12 — Resgate | Preservar `CONFIDENCIAL #54B87FG32`. Não inventar relato para preencher o arquivo. |
| 13 — Infiltração | Manter. Três blocos bastam: ordem/viagem, reconhecimento e tomada da base. Conferir Hadleys Hope em Zeta Herculis com o autor; tratar como cânone da campanha até confirmação. |
| 14 — Invasão | Manter. Separar objetivo, infiltração e demolição/resultado. Texto já curto e coerente. |
| 15 — Desabilitar comunicações | Preservar `CORROMPIDO`. |
| 16 — Sabotar suprimentos | Preservar `Sem retorno`. |
| 17 — Alto Comando, Divisão de Operações Especiais | Formatar como comunicado: protocolo, declaração, lista nominal e encerramento. Corrigir `combate):.`. Manter a diferença entre esquadrão desaparecido e integrantes presumidos mortos; não transformar presunção em morte confirmada. |

## Pontos de apresentação no código

`src/lib/narrative.js` separa alguns parágrafos antes de horários e dos marcadores de baixas, mas apenas quando identifica um ponto seguido de espaço em texto não censurado. Por isso:

- Horários no início ou dentro de uma tarja podem permanecer no bloco anterior. Isso é especialmente visível em Phantom (parte 2).
- `ali.01:00` não é reconhecido como separação, por faltar espaço.
- “DOIS DIAS DEPOIS” não recebe destaque próprio.
- Parágrafos explícitos digitados no editor não são convertidos em elementos de parágrafo por essa função. A apresentação de quebras depende também do CSS aplicado.

Uma melhoria futura deve reconhecer os limites dos parágrafos mantendo cada fragmento censurado dentro de sua tarja. O teste existente protege o conteúdo interno das tarjas contra exposição e não deve ser simplesmente removido. Também convém distinguir cabeçalhos, listas e parágrafos sem passar a interpretar HTML arbitrário vindo do editor.

## Decisões editoriais pendentes

- Definir a voz dos relatos oficiais: primeira pessoa da equipe ou terceira pessoa institucional. Há alternância de voz e de tempo verbal no acervo.
- Confirmar as grafias de nomes e patentes: Gal Dagot/Gadot, Song Ling/Lin, Chistopher/Christopher e Major/General Thomaz. Não assumir que toda diferença seja erro.
- Confirmar datas e viradas de dia antes de acrescentar marcadores cronológicos. As datas do universo nunca devem ser substituídas pelas datas reais das sessões.
- Confirmar a abrangência das censuras com barras desequilibradas antes de qualquer correção automática.

Prioridade sugerida: corrigir a apresentação e a pontuação; depois revisar voz e nomenclatura com o autor. Criar novos registros históricos somente quando houver uma divisão de sessão ou documento identificável, preservando links e associações existentes.
