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

## Consolidação — 25/10/2026

Concluídos localmente: expansão do catálogo físico (incluindo 24 peças de ambientes), categorias recolhidas, prévia de inserção, otimização da viewport e revisão da ventilação. Dutos têm acessos configuráveis, junções por extremidade e acompanhamento geométrico das paredes. Conexões de ventilação entre pavimentos ficam para uma etapa futura. Publicação deste conjunto em preparação.

## Expansão para colônias — adiada (25/10/2026)

Registradas as futuras ferramentas de água (lagos, rios e piscinas), circulação externa (caminhos, calçadas e ruas), relevo (ribanceiras, penhascos e cânions) e áreas de pedras/vegetação. **Trabalhar nas prioridades anteriores antes de iniciar esta frente.** A ordem sugerida e as diretrizes estão no [roadmap de terrenos e colônias](blueprint-builder.md#roadmap-futuro--terrenos-e-colônias-25102026). Registro apenas de planejamento, sem implementação ou publicação.

## Prioridades e ventilação — decisões de 26/10/2026

Este registro atualiza os adiamentos anteriores. Próxima sequência de desenvolvimento:

1. Acabamentos internos: consolidar regiões de piso já implementadas e acrescentar canaletas, grelhas e tampas de inspeção.
2. Ventilação por pavimento: apresentação contextual e exportação exclusiva, depois acessos intermediários e conexões entre pavimentos.
3. Água: piscinas, lagos e rios, aproveitando regiões e traçados. Continua planejada, ainda não implementada. Relevo, ruas e demais ferramentas de colônia ficam para etapas posteriores.

### Ventilação: comportamento aprovado

- Cada rede pertence ao seu pavimento e compartilha as coordenadas do mapa principal.
- Sobre salas e corredores: somente bordas tracejadas e discretas, sem preenchimento que oculte pisos ou equipamentos. Não esconder completamente esses trechos.
- No vazio: estrutura completa, preenchida e com contornos contínuos.
- Um mesmo duto pode atravessar ambas as situações. O tratamento é automático por trecho, recortado pela área efetiva dos ambientes, não aplicado ao duto inteiro por sua posição inicial ou final.
- Acessos no mapa principal permanecem discretos e legíveis, inclusive quando terminam no centro de uma sala.
- Na exportação exclusiva da ventilação, mostrar toda a rede com estrutura completa, sem o efeito tracejado contextual, sobre fundo opaco e sem as salas. Manter dimensões e alinhamento do pavimento principal.
- Permitir acessos intermediários em qualquer trecho: grelha lateral com escolha do lado, escotilha de teto ou piso. Um duto pode atender várias salas ou ter várias saídas para a mesma sala.
- Acesso lateral não corta nem encerra o duto. Distinguir acesso, extremidade e junção.
- Vincular os acessos ao trecho para acompanhar sua edição; remover um acesso não remove o duto. Prever nome/destino editável, com referência à sala quando disponível.
- Implementar conexões entre pavimentos depois dos acessos intermediários, reutilizando seu modelo. A apresentação contextual não altera a geometria física do trajeto.

Estas decisões são planejamento aprovado; os comportamentos novos de ventilação ainda não foram implementados. Não foi solicitado build ou publicação neste registro.

### Progresso em 26/10/2026

Canaletas e seis detalhes de inspeção concluídos localmente. Ventilação contextual e exportação exclusiva completa implementadas e verificadas tecnicamente (207 testes); aguardam conferência visual do usuário. Próximo bloco: acessos intermediários vinculados ao duto, seguido das conexões entre pavimentos. Água permanece na sequência posterior. Sem build/publicação nesta continuidade.

Acessos intermediários concluídos localmente em 26/10/2026: grelhas laterais, escotilhas piso/teto, destino manual e vínculo ao segmento. 210 testes aprovados; conferir conforme checklist. Próximo: conexões de ventilação entre pavimentos; depois água. Sem build/publicação.

Conexões de ventilação entre acessos existentes de pavimentos diferentes implementadas localmente em 26/10/2026, com destinos nos dois lados e limpeza de vínculos inválidos. 217 testes aprovados; conferência visual registrada. Próxima frente planejada: água (piscinas, lagos e rios). Sem build/publicação.

### Água — primeiro bloco local (26/10/2026)

Implementados piscinas e lagos em Região de piso / água (acabamento), e rios em Traçado. Piscinas têm contorno duplo; lagos suavizam o polígono por curvas quadráticas contidas nos pontos de controle; rios usam largura constante e curvas opcionais. Superfícies opacas, ondas por padrão SVG sem milhares de objetos e cores da blueprint. Edição por vértices, salvar/reabrir e biblioteca de módulos reutilizam os fluxos existentes. Água não cria paredes nem altera a ventilação.

Piscinas/lagos exportam na camada Estrutura; rios, em Equipamentos, abaixo dos assets. Não há união automática entre regiões/rios, largura variável por trecho ou simulação de profundidade nesta versão. Próximo passo: validar este bloco antes de expandir margens e integração com relevo; ruas e terrenos continuam futuros. 226 testes aprovados; renderização inspecionada. Sem build/publicação.

### Próximo ajuste solicitado: extremidades de corredores

Remover as extensões de piso que ultrapassam o início e o fim das paredes dos corredores abertos. Alinhar o piso às extremidades reais, preservando os fechamentos, portas e janelas. Solicitação registrada durante o bloco de circulação externa; implementar após concluir esse bloco.

### Circulação externa — bloco local concluído

Traçado oferece Caminho, Calçada e Rua, com largura, curvas, borda ausente/simples/meio-fio duplo, acabamento liso/placas e faixa central opcional em ruas. O desenho mantém o estilo blueprint e cores do tema. A rede pinta bordas antes dos interiores; cruzamentos e encontros no mesmo nível não mantêm linhas internas. Detalhes e faixas são recortados nas junções. Objetos continuam independentes, editáveis por vértices e sem paredes físicas. Calçadas não são geradas automaticamente junto às ruas; são traçados separados. Cruzamentos representam o mesmo nível, não pontes.

Salvar/reabrir, módulos e exportação usam os dados existentes de traçados; circulação fica em Equipamentos abaixo dos assets. Renderização de cruzamentos, curvas e larguras diferentes inspecionada. 229 testes aprovados. Sem build/publicação. Próximo ajuste solicitado: retirar os prolongamentos do piso nas extremidades de corredores.

Ajuste das extremidades concluído: piso de corredores não se prolonga mais além dos pontos inicial/final, independente do fechamento. Também vale para acabamentos e mapas anteriores. 230 testes aprovados; conferência visual em lote registrada. Sem build/publicação.

### Módulos e exemplo renovados — 27/10/2026

Seis módulos refeitos com footprints reais do catálogo: ponte, enfermaria, alojamento, carga, engenharia e refeitório. Acrescentados laboratório e segurança/arsenal. Bancadas contíguas e aparelhos sobre bancadas substituem ícones ampliados. Entradas mantêm faixa livre; objetos continuam editáveis. Apenas novas inserções usam os layouts novos, sem modificar módulos pessoais ou plantas salvas.

Abrir exemplo agora cria Estação de pesquisa, 60 × 42 m, oito setores conectados, pisos discretos e ventilação de manutenção. Confirmação de substituição existente preservada. Layouts e exemplo verificados por renderização e testes de dimensões, acesso, IDs e biblioteca.

Acabamento de circulação corrigido: placas transversais seguem a direção local e curvas, limitadas a 600 juntas por traçado. Sem grade fixa. Ruas permanecem lisas; placas disponíveis para caminhos/calçadas. 233 testes aprovados. Sem build/publicação.

### Relevo: ribanceiras e penhascos — 27/10/2026

Primeiro bloco implementado em Traçado: Ribanceira / talude e Penhasco / escarpa. Linha alta contínua, faixa discreta do lado baixo, hachuras de comprimento alternado; penhascos têm fraturas angulares. Curvas e lado configuráveis, espaçamento 0,25–5 m, máximo de 600 detalhes por traçado. A largura controla o alcance visual (metade para o lado baixo), não uma altura física. Não cria paredes ou ligações entre pavimentos. Renderiza em Equipamentos, com a paleta do mapa, inclusive exportação e módulos. Cânions e regiões rochosas permanecem próximos blocos. 235 testes aprovados; renderização inspecionada, sem build/publicação.

### Decisão vigente — relevo suspenso (27/10/2026)

A pedido do usuário, retiradas da aplicação as novas ribanceiras e penhascos (interface, renderização e campos novos). O design não foi aprovado. Manter relevo, cânions e regiões rochosas apenas no roadmap, sem continuar essa frente até nova definição. Borda de desnível anterior, água, circulação, módulos e demais funcionalidades preservados. O registro de implementação anterior é histórico e não descreve a versão atual. Sem build/publicação.

### Revisão do catálogo — 27/10/2026

Concluídos localmente 19 desenhos revisados, 26 assets novos, famílias recolhidas e duas faixas desenháveis. Treze ícones antigos retirados das novas inserções, preservando leitura dos mapas existentes. 235 testes aprovados; pranchas inspecionadas. Lista e conferência em [revisao-assets-2026-10-27.md](revisao-assets-2026-10-27.md). Próximo: conferência visual do usuário e discussão da simplificação da interface. Relevo continua suspenso. Sem build/publicação.

### Interface — bloco 1, organização (27/10/2026)

Criação e biblioteca de módulos à esquerda; propriedades da seleção primeiro à direita, seguidas de objetos e camadas. Projeto/escala, recuperação, exportação e ajuda movidos ao topo em painéis recolhidos. Catálogo com família destacada, categorias recuadas e linha de hierarquia. Balões da viewport preservados. Próximos blocos: seletores com miniaturas; depois separar forma e finalidade nas ferramentas de áreas e percursos. Sem build/publicação.

### Interface — bloco 2, seletores visuais

Miniaturas com nome curto e estado ativo substituem listas de abertura, parede avulsa, tipo de parede editada, piso e traçado. Parede ao desenhar também disponível à esquerda; balão existente preservado. Pisos e percursos reutilizam renderizadores do mapa. Valores numéricos e controles específicos mantidos. Próximo bloco: unificar áreas e percursos separando forma e finalidade. Sem build/publicação.

### Interface — áreas unificadas

Entrada Áreas na viewport substitui os quatro botões de salas e região. Finalidade (sala/piso/piscina/lago) e forma (retângulo/elipse/vértices) ficam separadas à esquerda. Áreas sem paredes usam floorRegion existente; elipses são aproximadas por contorno editável. Compatibilidade dos arquivos preservada. Próximo: organizar corredores, ventilação e demais percursos em família comum, preservando suas regras. Sem publicação.

### Interface — percursos unificados

Uma entrada Percursos reúne corredor, ventilação e traçados na viewport. Seletor visual compartilhado mantém tipos físicos e controles específicos. Larguras iniciais por finalidade; botões de concluir/voltar/cancelar aparecem somente durante o desenho. Edição de traçados existentes mantém seu seletor. Próximo: conferência integrada dos painéis, áreas, percursos e miniaturas antes de remover possíveis controles redundantes da viewport. Sem build/publicação.

### Compactação da interface

Medidas em duas colunas, sobreposição sempre visível, botões para cotas/módulos/bordas/acabamento/cor. Ajuda dos traçados recolhida. Cabeçalho reduzido, nome do projeto e indicação Local. Aviso rotineiro de edição local oculto no foco; demais mensagens preservadas. Conferência visual pendente, sem publicação.

### Colônias — decisões de 28/10/2026 (planejamento)

- Separar modos Construção e Colônia em Projeto e escala. Cada modo apresenta ferramentas e biblioteca próprias, compartilhando código quando adequado. Não misturar ferramentas internas com o planejamento externo.
- Colônias representam estruturas por fora, sem interiores, portas ou janelas individuais. Bibliotecas de estruturas grandes: edifícios, galpões, praças, feiras, parques, fazendas, minas, espaço-portos e equipamentos de infraestrutura. Identificação pela silhueta e detalhes, sem depender de texto.
- Escala configurável para mapas grandes; metros podem continuar como opção. Definir unidade de exibição e dimensão da grade sem redimensionar objetos acidentalmente.
- Revisar linguagem visual das estruturas e seus contornos; não reutilizar diretamente as paredes de salas como aparência final.
- Relevo deve representar assentamentos em níveis diferentes. Revisar também a borda de desnível atual; design anterior de relevo permanece rejeitado. Ainda definir convenções para talude, penhasco, cota/altura e edifícios altos.
- Implementação de colônias não iniciada: próximo passo é definir linguagem visual e comportamento do modo. Conversão de projeto existente entre modos ainda não definida.

Controles redundantes retirados: balão Parede ao desenhar e seletor Porta/Janela sobre a viewport. Escolhas permanecem na lateral. Navegação e manipulação direta preservadas. Conferência e desempenho anteriores aprovados pelo usuário; sem build/publicação nesta etapa.

### Base dos modos Construção / Colônia — 28/10/2026
- Implementado seletor em Projeto e escala; modo persistido no arquivo e recuperação local.
- Projetos antigos continuam em Construção. Alternar modo não converte, apaga ou redimensiona objetos.
- Colônia oferece áreas sem paredes, percursos externos e catálogo inicial filtrado (exterior, vegetação, comércio, transporte e veículos).
- Ferramentas de portas, paredes internas, módulos de interiores e conexões entre pavimentos permanecem em Construção. Pavimentos existentes continuam acessíveis para não esconder dados.
- Próximo bloco: taludes com hachuras, penhascos com fraturas e biblioteca de edificações externas detalhadas. Escala interna ainda em metros (até 2000 m); apresentação em km e terrenos maiores pendentes.
- Verificado: 11 testes direcionados e compilação do BlueprintEditor via Vite SSR. Sem publicação.

### Relevo de colônias — 28/10/2026
- Talude com hachuras alternadas e penhasco com fraturas implementados como traçados editáveis no modo Colônia.
- Direita/esquerda define o lado baixo; largura controla a extensão gráfica das marcas (não é altitude).
- Compatíveis com salvar/reabrir e renderização SVG compartilhada pela exportação; máximo de 600 marcas por traçado.
- Nove testes direcionados passaram; editor compilado e amostra renderizada inspecionada. Conferência interativa pendente.
- Próximo bloco: edificações externas detalhadas; regiões elevadas/depressões e cotas de terreno continuam pendentes. Sem build/publicação.

### Edificações externas — 28/10/2026
- Primeiro catálogo exclusivo de Colônia: bloco habitacional, hangar industrial, usina de processamento, estufas, plataforma de pouso, mercado coberto, silos e posto de controle.
- Coberturas opacas, proporções iniciais em metros, detalhes de telhado e infraestrutura; sem interiores. Renderização compartilhada com exportação.
- 6 testes direcionados aprovados, incluindo persistência dos 8 assets e reaproveitamento via módulos. Prancha renderizada inspecionada.
- Próximos blocos: expandir estruturas após validação, cotas/áreas de terreno e escala de colônias. Sem publicação.

### Revisão visual das coberturas — 28/10/2026
- Revisados sete assets externos; plataforma de pouso aprovada mantida intacta.
- Vocabulário comum: parapeito espesso com contorno interno, claraboias com caixilhos/reflexos, exaustores com carcaça e três pás, painéis segmentados, tanques com bocais/escadas, antena com prato oval/braços/base.
- Mantidos identificadores, dimensões e compatibilidade com mapas existentes. Três testes direcionados passaram; prancha dos oito assets renderizada e inspecionada.
- Pendente validar legibilidade das coberturas na viewport, especialmente estufas e antena do posto de controle. Sem publicação.

### Expansão colonial — 16 estruturas, 28/10/2026
- Contenção de reator; laboratório; administração; posto médico; hospital; segurança; habitação compacta e alta densidade; armazém de cargas e refrigerado; processador atmosférico; hidroponia; tratamento de água; subestação elétrica; oficina/garagem; comunicações.
- Catálogo Colônias dividido em habitação/administração, ciência/saúde/segurança, indústria/logística e cultivo/serviços essenciais.
- Vocabulário compartilhado de coberturas, carcaças, caixilhos, tubulações e antenas. Dimensões iniciais físicas; estruturas opacas com espaços externos vazios.
- 4 testes direcionados aprovados, incluindo persistência/reuso de todos os 24 edifícios; duas pranchas renderizadas e inspecionadas.
- Sem build/publicação; validação interativa pendente.

### Infraestrutura, bordas e edição numérica — 28/10/2026
- Mantida a espessura dos edifícios aprovada pelo usuário. Cor das pás explicitamente vinculada à paleta no SVG exportado.
- Colônias aceitam até 10.000 × 10.000 m e zoom até 1024×. Construções mantêm limite de 2.000 m.
- Assets de Colônia aceitam origem negativa até -2000 m e podem atravessar bordas; exportação recorta no retângulo do projeto. Objetos continuam íntegros no arquivo. Outras geometrias mantêm limites anteriores.
- NumberField compartilhado: digitação transitória livre (incluindo campo vazio), aplicação ao perder foco/Enter, Escape cancela; zero permanece inválido para dimensões que exigem valor positivo.
- Rua → Calçadas automáticas (m por lado): geometria derivada da mesma curva da rua, seguindo edição e largura. Zero desliga. Calçadas independentes existentes não são vinculadas automaticamente.
- Traçados Tubulação, Fiação, Eletrocalha disponíveis nos dois modos. Novos assets de Área externa: poste de braço duplo, transformador, tampa circular e tampa dupla.
- Conferidas imagens de junção e recorte/cor; revisão React aplicada a estado transitório local, sem repintar a viewport a cada tecla, geometria de calçadas memoizada.
- Navegador headless indisponível no ambiente: interação dos campos permanece pendente de conferência manual. Sem publicação.
- Verificação final deste bloco: 247 testes passaram, zero falhas (TEMP/TMP em .test-tmp/test-temp para evitar restrição de rename do sandbox); BlueprintEditor compilado via Vite SSR. Renderização final da junção e recorte inspecionada após ajustes.
