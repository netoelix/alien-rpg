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

### Expansão de interiores — restaurantes, contenção e decoração

27 novos assets em vista superior, com dimensões físicas e preenchimento dos corpos sólidos. Novos grupos Restaurantes e serviço de mesa e Prisão e contenção. Inclui oito peças de restaurante, seis de contenção, seis decorativas, quatro de apoio ao cassino e três de hotelaria/serviços/segurança. Quadros de parede representam a moldura vista de cima. Grade de contenção é decorativa, sem substituir paredes estruturais.

Verificados catálogo, persistência das dimensões e reutilização em módulos (4 testes direcionados aprovados). Pranchas de revisão em outputs/colonia-conceitos/interiores-1.png a interiores-3.png. Alterações locais; publicação não solicitada neste bloco.

### Academia, contenção e colchões avulsos

Dez novas peças: esteira ergométrica, bicicleta ergométrica, banco de supino, estação de musculação, suporte de halteres, mesa de refeitório ancorada, cama de cela individual, carrinho de limpeza e colchões avulsos solteiro/casal. Categoria Academia e condicionamento em Lazer e hospitalidade. Sofá VIP redesenhado com dois bancos costas com costas, seis almofadas, braços e encosto central; identidade e dimensões anteriores preservadas. Colchões sem estrutura ou roupa de cama, com borda e capitonê. Pranchas academia-colchoes-1.png e academia-colchoes-2.png conferidas. Publicação não solicitada.

### Mineração e produção industrial — primeiro bloco

12 peças em categoria própria, disponíveis em construção e colônia: vagoneta compacta, locomotiva de bateria para mina, perfuratriz sobre esteiras, carregadeira subterrânea articulada, britador, moega, prensa hidráulica, célula de soldagem e esteira modular (reta, curva de 90 graus, transferência, terminal motorizado). Vagoneta e veículos de mina complementam os veículos grandes existentes. Esteiras com 1,20 m de largura; posicionamento manual, sem conexão automática ou simulação. Demais itens da lista aprovada permanecem para expansão posterior. Pranchas mineracao-1.png e mineracao-2.png revisadas. Alterações locais, sem publicação.

### Mineração e produção — segundo bloco

15 peças adicionais completam a proposta: vagoneta basculante, plataforma ferroviária compacta de mina, perfuratriz jumbo de dois braços, peneira vibratória, guincho de extração, transportador de roletes, esteira coberta, mesa giratória de carga, elevador industrial, guilhotina, calandra, forno de fundição, misturador, máquina de envase e ponte rolante. Categoria soma 27 peças. Pranchas mineracao-expansao-1/2/3.png conferidas. Partes abertas da ponte e transportador preservam transparência; carenagens e plataformas sólidas ocultam objetos abaixo. São assets estáticos, sem animação nem conexão automática entre pavimentos. Sem publicação neste bloco.

### Planejado para discussão — pavimentos, ciclos e ajuda contextual

Solicitações registradas em 29/10/2026; sem implementação nesta etapa.

- Integrar o asset de elevador industrial às conexões entre pavimentos, com destinos selecionáveis e preservação de instâncias decorativas existentes.
- Suportar subsolos, com identificação explícita abaixo do térreo. Definir a relação entre nome, ordem e nível físico antes de implementar; renomear sozinho não deve alterar vínculos.
- Reordenar pavimentos existentes somente quando não houver conexão com pavimento acima ou abaixo, conforme pedido do usuário. Discutir tratamento de elevadores com vários destinos e dutos antes de liberar a operação; preservar identificadores e nunca redirecionar conexões silenciosamente.
- Permitir concluir traçados no ponto inicial para formar ciclos, começando pela ventilação. Fechar a geometria sem grelhas/tampas artificiais na emenda, preservar largura/curvas, acessos intermediários, exportação e persistência. Definir como reabrir o ciclo e avaliar extensão a outros traçados compatíveis.
- Reduzir texto permanente nas propriedades, especialmente ventilação. Proposta: botão de informação junto ao controle/grupo, ajuda por hover e foco de teclado, também acessível por clique/toque. Manter rótulos, estados e mensagens essenciais visíveis. Discutir layout antes de alterar a interface.
- Lista aprovada de mineração/produção concluída: 27 assets (24 conceitos originais; esteira aberta detalhada em quatro módulos). Restam evoluções funcionais acima, não assets dessa lista.

### Proposta complementar — conexões espaciais de ventilação e traçados

Para discussão antes de implementação:

- Ao conectar ventilação a outro pavimento, selecionar o destino e criar automaticamente um acesso correspondente nas mesmas coordenadas X/Y. Se houver duto compatível no destino, reutilizá-lo; se não houver, propor um ponto de acesso inicial a partir do qual desenhar o novo duto, sem inventar direção/comprimento. Interface deve distinguir acesso criado de trecho ainda não desenhado.
- Substituir a seleção indiscriminada de acessos por correspondência espacial validada. Destacar destino, posição e compatibilidade; não vincular silenciosamente saídas distantes. Preservar vínculos antigos até revisão explícita.
- Acessos entre pavimentos devem ter relação coerente de teto/piso. Definir comportamento de movimento, exclusão, desfazer e edição dos pares, evitando deixar vínculos inconsistentes.
- Trechos de ventilação podem conectar ponta a ponta, formando uma rede contínua sem grelha/tampa na junção. Avaliar também ponta em lateral para derivações T, com confirmação visual de encaixe. Cruzamento visual por si só não cria conexão.
- Considerar nós compartilhados de conexão mantendo trechos editáveis individualmente, inclusive ciclos; validar tolerância de encaixe, larguras distintas, curvas e acessos existentes.
- Estender o princípio a corredores, ruas e caminhos, com regras próprias: respeitar paredes/aberturas explícitas em corredores, tipo/nível dos traçados externos, bordas e calçadas. Não unir famílias incompatíveis automaticamente.
- Sequência sugerida: acessos verticais coincidentes; rede de ventilação e ciclos; extensão a outras famílias após validação.

### Conexões verticais de ventilação — primeira implementação

- Seletor de pavimento substitui lista de acessos arbitrários. Cria/reutiliza acesso oposto teto/piso nas mesmas coordenadas, com vínculo bidirecional e navegação existente.
- Duto coincidente é reaproveitado; múltiplos dutos no ponto, destino travado/oculto ou acesso incompatível geram erro sem mutação.
- Sem duto no destino, cria trecho inicial do comprimento da largura do duto de origem, centralizado no acesso, com mesma orientação. Escolha técnica explícita desta etapa: usa duto editável existente em vez de nova entidade de acesso isolado. Não desenha o percurso completo. Limites da planta validados.
- Vínculos legados preservados. Criação entregue em uma única alteração de projeto. Seis testes passaram, incluindo ida/volta de salvamento e renderização dos controles.
- Pendentes: conferência interativa de desfazer/refazer; sincronização de movimentos posteriores (não implementada); ciclos/continuidade e demais tópicos do roadmap. Sem publicação.

### Ciclos de ventilação — primeira etapa

- Durante desenho de dutos: clicar no início após três pontos ou usar Fechar ciclo. Fecha com ponto final coincidente, preservando formato de arquivo existente.
- Renderização completa usa contorno fechado; referência contextual inclui a quina da emenda. Ciclos não exibem acesso automático nas pontas.
- Continuidade entre trechos já existente confirmada por testes: pontas automáticas próximas unem a rede, cruzamentos simples não unem; tampas/acessos explícitos continuam independentes. Não são vínculos rígidos: mover um trecho não arrasta o outro.
- 18 testes direcionados passaram, incluindo salvamento, renderização e compilação do editor. Aviso de porta HMR ocupada durante testes paralelos, sem falhas.
- Pendente conferência visual; edição dos dois vértices coincidentes ainda independente (afastá-los reabre o ciclo). Prévia de encaixe e edição coordenada de nós ficam para próxima etapa. Sem publicação.

### Edição de ciclos e indicação de encaixe

- Mover qualquer vértice da emenda move ambos os pontos coincidentes, preservando o ciclo. Remover o canto inicial/final fecha novamente o contorno, mínimo três cantos.
- Durante desenho de ventilação, marcador circular destaca conexão potencial ou retorno ao início; encaixe em objetos ativo ajusta ao eixo do duto dentro da tolerância de 0,15 m. Alt ignora o encaixe; pontas explicitamente tampadas continuam independentes.
- 11 testes passaram, incluindo edição de emenda e compilação do editor. Pendente conferência interativa do marcador/encaixe.
- Nós entre dutos distintos ainda não arrastam juntos; sincronização vertical e comando explícito para reabrir ciclos permanecem pendentes. Sem publicação.

### Ajuda contextual do Blueprint

Aplicado componente compartilhado de informação aos painéis de projeto/escala, recuperação, exportação, desenhos, paredes, acessos de ventilação, propriedades/vértices/conjuntos, módulos, objetos e referências de pavimentos. Textos de ajuda abrem com hover/foco; clique/toque fixa ou fecha; Escape fecha sem cancelar a ferramenta. Conteúdo no fluxo do painel evita recorte em scroll lateral. Estados, erros, rótulos e aviso de exportação opaca mantidos visíveis; seção dedicada de atalhos permanece consultável.

Dez testes direcionados passaram, incluindo compilação do editor e controles de conexão. Verificação interativa de mouse/teclado/toque pendente. Sem publicação.

### Compactação dos painéis globais e acessos

- Configurações globais abrem dialogs nativos com foco modal, Escape e botão Fechar. Faixa única reúne projeto, recuperação, exportação, atalhos, seletor de pavimento, gerenciamento e referências/conexões. Conteúdo não aumenta a altura da página.
- Seletor de pavimento permanece direto; operações de gerenciamento em janela. Posicionar conexão fecha a janela para permitir clique na planta.
- Cada acesso de ventilação inicia recolhido, resumo nome/tipo. Ajuda de posicionamento/conexão unificada. Ícones sem borda quadrada, rótulo curto de assunto; hover/foco/toque mantidos.
- Dez testes direcionados passaram e editor compilou. Interação dos dialogs, modo foco, viewport estreita e posicionamento devem ser conferidos visualmente. Sem publicação.

### Auditoria técnica — 29/10/2026

Relatório: docs/auditoria-blueprint-2026-10-29.md. Análise sem alterar funcionalidades. Baseline: 254 testes passaram. Prioridades: primitivas geométricas e acesso seguro a pavimentos; ciclos de imports; normalização/transações; separação do editor; contratos de traçados; catálogo. Preservar diferenças semânticas entre dutos, corredores e circulação externa. Profiling e conferência de foco/modal permanecem pendentes. Retomar features do roadmap após os blocos técnicos aprovados.
