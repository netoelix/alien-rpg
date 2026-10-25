# Criador de plantas — primeira versão

## Roadmap acordado — paredes e conexões

Registrado em 19/10/2026. Primeiro bloco implementado localmente: trechos explícitos, aberturas livres, estilos e padrões por ambiente. Os critérios abaixo orientam a evolução; veja as limitações e verificações ao fim deste documento.

### 1. Conexões entre salas e corredores

Problema observado na referência enviada: ao sobrepor um corredor a uma sala, a divisória desaparece visualmente, pode restar uma linha residual e a porta parece flutuar sobre o piso. Quando os ambientes estão separados, a parede da sala e o vínculo visual da porta ficam claros. Investigar a composição dos preenchimentos, contornos e recortes antes de definir a solução técnica.

- Permitir escolher, por trecho de conexão, entre parede preservada, parede com porta e abertura livre.
- Preservar a parede escolhida mesmo quando há sobreposição de pisos; a porta deve recortar somente sua abertura, mantendo os trechos de parede ao redor visíveis.
- Na abertura livre, remover apenas o trecho desejado, sem apagar toda a lateral da sala nem deixar linhas residuais.
- Atender salas retangulares, circulares/ovais e poligonais, além dos corredores.
- Preferir seleção direta do trecho na viewport. Avaliar controles complementares no painel de propriedades; remover uma parede não deve exigir apagar um vértice ou deformar a sala.
- Definir o comportamento de portas existentes quando seu trecho vira abertura livre, evitando portas órfãs ou remoção silenciosa.

Critérios de aceitação: reproduzir o caso da imagem com e sem porta, com parede e com abertura livre; verificar diferentes ordens de criação dos objetos, movimento e edição de vértices; preservar o resultado ao desfazer/refazer, salvar/reabrir e exportar PNG/SVG. Mapas antigos devem continuar abrindo sem perda de dados.

### 2. Tipos de parede e aparência da instalação

- Tipos por trecho: divisória interna, parede estrutural, casco externo, vidro e abertura livre.
- Diferenciar visualmente com espessura de linha, contorno duplo, preenchimento, hachura ou marcações, mantendo a leitura no estilo blueprint e na exportação.
- Oferecer padrões iniciais para nave, estação espacial e instalação planetária, com possibilidade de substituir o tipo individualmente em cada trecho.
- Começar pela espessura visual, sem alterar medidas ou espaço útil das salas. Espessura física em metros fica para uma etapa posterior, pois exige decidir como a parede cresce em relação ao contorno e como isso afeta encaixes e portas.
- Separar o tipo funcional da parede da aparência geral da instalação, permitindo combinar estilos no mesmo mapa.

Ordem proposta: resolver primeiro a conexão e o controle de trechos; depois aplicar os tipos visuais e os padrões de instalação. A ampliação de assets continua prevista de forma gradual.

Acesso público em `/#/blueprints`, pelo botão **CRIAR PLANTA**. É uma ferramenta independente do acervo de campanhas e da autenticação administrativa.

## Uso

1. Abra o exemplo para explorar ou comece uma planta vazia.
2. Defina largura/altura em metros, grade de encaixe e aparência. Mudar a grade não redimensiona objetos.
3. Arraste salas retangulares ou ovais. Para corredores e ventilação, clique nos pontos e conclua pelo botão ou Enter. Escape cancela.
4. Posicione portas perto de paredes. Elas são ancoradas à sala/corredor; remover a porta recompõe o contorno, mover a sala leva a porta junto.
5. Escolha equipamentos ou um módulo. Os módulos são compostos por objetos independentes.
6. Use Selecionar / mover e o painel de propriedades para medidas, rotação e remoção. Há 50 estados de desfazer, além de refazer.
7. Mostre/oculte, bloqueie e altere a opacidade de cada camada.
8. Salve um `.alien-map` para retomar a edição depois. O arquivo é JSON validado; campos desconhecidos são descartados e arquivos inválidos não substituem a planta.
9. Exporte PNG ou SVG. A seleção de camadas e o fundo transparente permitem exportar apenas ventilação. Todas as exportações usam a extensão completa da planta, independentemente do zoom, com alinhamento idêntico. Camadas ocultas não são exportadas; grade e indicadores de seleção também não.

## Privacidade e armazenamento

Não existem endpoints, chamadas de rede, banco de dados ou upload para os projetos. A criação ocorre em memória nesta aba. Navegar pelo site e voltar mantém a planta enquanto a página não for recarregada.

A recuperação automática é opcional e inicialmente desligada. Usa somente `localStorage` com a chave `alien-blueprint-recovery-v1`, pode ser recuperada ou apagada pelo usuário e não substitui o download do projeto. Dados locais podem ser eliminados pelo navegador. Há aviso de saída/recarregamento quando existem alterações não baixadas como projeto.

O carregamento normal do site continua dependendo da hospedagem. Os desenhos não são enviados junto com esse acesso.

## Limites desta etapa

- Cinco camadas fixas; um pavimento por arquivo. Pavimentos múltiplos, biblioteca pessoal de módulos e camadas personalizadas ainda não implementados.
- Retângulos, elipses, salas poligonais e corredores por segmentos; curvas livres ficam para uma evolução seguinte.
- Cruzamentos de dutos são visuais, sem simulação de conectividade ou passagem acima/abaixo.
- Dezesseis assets SVG originais simples e seis módulos (ponte, enfermaria, alojamento, depósito, engenharia e refeitório). O detalhamento visual será ampliado após feedback.
- Importação até 5 MB, 3000 objetos e 500 pontos por traçado; planta até 2000 × 2000 m. PNG até 4096 pixels no maior lado.
- Portas sobre paredes elípticas usam aproximação de 64 segmentos. Portas em quinas e encontros complexos precisam de conferência visual.

## Verificação

Testes de escala e serialização, ancoragem e movimento de portas, remoção dependente, módulos independentes, paredes de corredores e elipses e validação de importação. Renderização React estática e rasterização de um SVG de exemplo foram verificadas. A edição por arraste de vértices foi conferida no navegador local. A biblioteca recuperada também foi conferida na interface: dezesseis equipamentos e seis módulos disponíveis.

## Edição rápida

Selecione uma peça para duplicar (Ctrl+D), mover com as setas na grade ou girar equipamentos com R (Shift+R inverte). Shift+setas move dez passos. Os botões do painel também duplicam e giram. Os atalhos atuam com foco na área de desenho.

Duplicar uma sala ou corredor copia suas portas com vínculos próprios; os equipamentos internos continuam independentes e devem ser duplicados separadamente. Portas avulsas são inseridas pela ferramenta Porta. Camadas ocultas ou bloqueadas impedem a cópia das peças vinculadas. Desfazer reverte a duplicação inteira.

## Salas por vértices

Escolha Sala por vértices e clique nos cantos em sequência. Enter ou Concluir traçado fecha o contorno automaticamente, sem repetir o primeiro ponto. Backspace ou Remover último ponto corrige o traçado; Escape cancela. Salas em L e outros polígonos simples aceitam portas, movimento e duplicação. Contornos cruzados, pontos repetidos e salas sem área são recusados. Após concluir, use Selecionar / mover e arraste as alças circulares para ajustar os vértices. O painel Vértices permite editar coordenadas numericamente. Isso também funciona em corredores e ventilação. Portas conservam seu vínculo com a borda; um contorno inválido é recusado ao soltar. No painel, + PONTO insere um vértice no meio do segmento seguinte; REMOVER exclui o vértice escolhido. Salas precisam manter pelo menos três pontos e traçados abertos, dois. Portas em segmentos afetados são reposicionadas na mesma estrutura e devem ser conferidas após a alteração.

## Fluxo de desenvolvimento local

As próximas etapas ficam locais até autorização para publicar o conjunto. Edição de vértices validada no servidor da porta 3841: arraste de um ponto do corredor e conferência das coordenadas no painel. Verificação automatizada: 79 testes e build aprovados.

A biblioteca de equipamentos permite buscar pelo nome sem diferenciar acentos ou maiúsculas. A busca filtra a lista e mantém a peça selecionada, indicada acima dos resultados.

## Viewport e navegação

As ferramentas ficam em uma barra de ícones dentro da viewport, com nomes acessíveis e dicas ao passar o mouse. Os painéis laterais podem ser ocultados. O modo de foco ocupa a janela e mantém os comandos de arquivo disponíveis.

Na planta: botão do meio ou direito + arraste move a visão sem trocar a ferramenta; Espaço + arraste também move a visão. H ativa a ferramenta de navegação. + e − alteram o zoom; Home enquadra; F alterna o foco; Escape cancela e sai do foco. V seleciona; B desenha sala retangular; P polígono; O sala oval; C corredor; D porta; N ventilação; A equipamento; M módulo; T texto. Ctrl+D, R e as setas conservam os comandos de edição existentes. Os atalhos só atuam quando a planta está focada, preservando a digitação nos campos e a navegação por Tab.

Validação local da viewport: modo de foco, ferramentas por teclado, enquadramento e arraste pela ferramenta H conferidos no navegador. Cliques direito e central não adicionam objetos. O arraste mantendo esses botões e Espaço deve também ser conferido com o mouse físico, pois o controle de navegador utilizado só oferece arraste com o botão esquerdo.

## Paredes e conexões — primeiro bloco

Use **Editar paredes (W)** e clique perto da borda, inclusive onde um corredor encobre o contorno da sala. O painel permite escolher a borda, o início/fim em porcentagem e o tipo. A seleção aparece tracejada. Aplicar trecho mantém a divisória por cima dos pisos; as portas existentes recortam sua passagem. Abertura livre apaga o contorno no intervalo. Automática restaura a união original dos ambientes.

Tipos: divisória fina, estrutural espessa, casco com linha dupla e vidro com marcação tracejada. Padrões por ambiente: divisórias de nave, casco de nave/estação e instalação planetária. Esses botões substituem todos os trechos personalizados da sala/corredor selecionado; Desfazer recupera a configuração anterior. Não alteram o espaço útil ou as dimensões.

Trechos são salvos dentro da estrutura e acompanham movimento, redimensionamento e duplicação. O projeto antigo sem trechos mantém o comportamento anterior. Criar abertura livre onde há uma porta é recusado: mova ou remova explicitamente a porta primeiro. Adicionar uma porta sobre abertura livre também é recusado.

Limites desta etapa: paredes curvas usam as 64 bordas aproximadas já existentes no modelo. Mover vértices mantém os trechos; adicionar/remover vértices exige restaurar paredes automáticas antes, para evitar associações incorretas. Edição contínua de arcos permanece no roadmap. As espessuras são visuais em unidades do desenho, não representam ocupação física.

Validação: 83 testes (incluindo arquivo, movimento, duplicação, abertura com porta, tipos inválidos, camada bloqueada e bordas curvas/poligonais), formatação e build. Conferida na interface a preservação de uma parede de casco na conexão com corredor e o recorte da porta.

Exportação real de PNG e SVG conferida no navegador local; corrigido o recorte que criava pequenos vãos nas laterais do corredor ao aplicar casco. O SVG exportado conserva as máscaras de parede e remove os controles exclusivos do editor.

Correção de substituição visual: cada estrutura com trechos personalizados remove seu próprio contorno original antes de desenhar o novo estilo. O recorte não apaga contornos de corredores vizinhos. A divisória fina foi conferida na conexão do exemplo; o casco mantém intencionalmente duas linhas como acabamento, sem sobrepor uma terceira parede antiga.

Alinhamento e cantos: a espessura personalizada cresce para fora do piso, usando a mesma borda da parede automática. Trechos consecutivos do mesmo tipo com extremidades coincidentes formam um único contorno com junções arredondadas, incluindo o fechamento de salas e a linha dupla do casco. Extremidades separadas nas curvas de corredores ainda não são conectadas por esse agrupamento.

Validação deste ajuste: 86 testes, formatação e build aprovados. Divisória e casco completo conferidos no editor local; PNG exportado também conferido, com contorno contínuo e recorte da porta.

## Portas e janelas: regra de alinhamento

A ferramenta **Portas e janelas (D)** permite escolher o tipo e a largura antes de clicar na parede. A seleção de uma abertura existente permite convertê-la entre porta e janela. Janelas usam três linhas na cor da estrutura; portas conservam a cor de destaque. Ambas pertencem à camada Portas e janelas e acompanham a estrutura ao mover, duplicar ou remover o ambiente.

O vínculo salvo continua sendo a borda do piso (`wallId`, `segment`, `t`). `openingGeometry` calcula apenas a posição visual, deslocando o centro da abertura para fora por metade da espessura da parede: 0,10 m em paredes automáticas, divisórias e vidro; 0,225 m em paredes estruturais; 0,35 m no casco. A direção externa considera a orientação do polígono e o lado do corredor. O batente e o recorte abrangem toda a espessura, com margem de 0,12 m e meia altura mínima de 0,35 m. Trocar o tipo da parede recalcula a abertura automaticamente, sem alterar os dados salvos.

Quando uma abertura intersecta trechos personalizados, a maior espessura determina o alinhamento e o recorte. Evite posicionar aberturas nas quinas ou atravessando transições de espessura: o símbolo permanece reto e não tem batentes escalonados. Em elipses, permanece a aproximação de 64 segmentos.

Compatibilidade: janelas são aberturas ancoradas com `kind: door` e `openingType: window`. Projetos antigos sem `openingType` continuam representando portas. Essa distinção é preservada no arquivo `.alien-map`; a janela nesta etapa é um símbolo de planta, sem simulação de luz, passagem ou exportação para Foundry.

Validação: 90 testes e build aprovados, incluindo deslocamento nas quatro bordas, orientação de polígonos, lados do corredor, trechos parciais e preservação das janelas na serialização, duplicação e remoção.

## Vários trechos na mesma borda

Aplicar um intervalo substitui apenas aquela parte da parede. Por exemplo: aplicar vidro entre 30% e 70% de uma borda de casco preserva casco em 0–30% e 70–100%. Estilos iguais adjacentes são unidos automaticamente. Automática restaura apenas o intervalo escolhido, sem apagar os demais trechos.

Em Editar paredes, clique no trecho desejado para carregar seus limites. Clicar numa parte automática seleciona o intervalo livre entre os trechos vizinhos. O painel Trechos desta borda oferece a lista de estilos e percentuais, além de Selecionar borda inteira. Desfazer/refazer mantém o histórico completo. Os padrões por ambiente continuam substituindo todos os intervalos.

Arquivos antigos permanecem válidos. A importação aceita múltiplos intervalos sem sobreposição, com limite de 1000 trechos por estrutura. Portas e janelas continuam impedindo a criação de abertura livre sobre sua posição.

Validação: 94 testes e build aprovados; combinação de casco/vidro na mesma borda conferida no editor local.

## Edição de arcos

Em salas circulares/ovais, Editar paredes → Editar arco contínuo permite definir início e fim em graus. Zero fica à direita, com avanço horário. Use 270–450° para atravessar zero. Atalhos de 90°, 180° e contorno inteiro definem a extensão a partir do início atual. O tracejado branco antecipa o arco inteiro e fica excluído da exportação. Aplicar usa o tipo escolhido e gera uma única etapa no histórico. A geometria persistida conserva a aproximação em 64 segmentos; a prévia usa a curva da elipse. Aberturas sobre portas/janelas são recusadas sem aplicar parcialmente o arco.

## Encontros de corredores e limites de aberturas

Trechos personalizados que chegam às curvas externas do corredor recebem uma ligação arredondada. Com tipos diferentes, a ligação usa o acabamento de menor espessura; curvas internas do mesmo tipo compartilham um vértice, com limite para evitar prolongamentos em curvas muito fechadas. Encontros entre estruturas independentes ainda exigem revisão; não há união geométrica geral entre paredes de salas diferentes.

Nas edições do mapa, portas e janelas em bordas retas são ajustadas para manter largura e margem de batente de 0,12 m dentro da borda. Se não couberem, a alteração é recusada. Elipses são excluídas dessa limitação por segmento, pois seus segmentos representam uma curva contínua. Arquivos antigos não são alterados ao abrir; o ajuste ocorre ao editar e pode ser desfeito. Validação: 98 testes e build, com casco de corredor conferido no navegador.

## Sala com equipamentos

Nas propriedades de uma sala retangular, Sala com equipamentos permite mover ou duplicar o conjunto com deslocamento X/Y em metros. Inclui equipamentos totalmente contidos (considerando sua rotação) e portas/janelas vinculadas; não inclui corredores, dutos ou anotações. A cópia recebe IDs novos e vínculos próprios, fica selecionada após aplicar e exige deslocamento diferente de zero. A operação respeita camadas bloqueadas, limites do mapa e Desfazer. Ainda não representa agrupamento persistente nem seleção múltipla livre.

O painel Sala com equipamentos também oferece rotação de +90° e −90° em torno do centro da sala. A largura e altura são trocadas, equipamentos giram com a sala, e os índices de bordas das paredes e aberturas são remapeados. A operação é recusada quando excede os limites da planta ou envolve camadas bloqueadas. Quatro giros restauram a geometria original. Não gira corredores, dutos ou outras estruturas conectadas.

## Opções de criação na viewport

Ao desenhar salas retangulares, ovais, poligonais ou corredores, o seletor flutuante Parede ao desenhar define o acabamento aplicado a todas as bordas da nova estrutura. A opção Automática mantém a união de ambientes. A escolha permanece durante a sessão e não altera estruturas existentes nem módulos prontos. Na ferramenta Portas e janelas, os botões flutuantes compartilham a seleção do painel lateral e conservam a última opção durante a sessão.

## Copiar e colar na viewport

Com foco na planta, Ctrl+C (ou Cmd+C) guarda uma cópia da peça selecionada na memória da aba. Ctrl+V cola com IDs novos e deslocamento de um passo da grade; colagens sucessivas aumentam esse deslocamento. Os botões Copiar seleção e Colar cópia na viewport oferecem as mesmas ações. A cópia não usa a área de transferência do sistema.

Salas retangulares incluem equipamentos totalmente contidos, considerando sua rotação, e portas/janelas vinculadas. Outras estruturas incluem suas aberturas; equipamentos, textos e dutos podem ser copiados individualmente. Portas/janelas avulsas devem ser criadas na parede pela ferramenta própria.

A última cópia forma um conjunto temporário: arrastar a estrutura ou usar as setas move também suas peças copiadas. Escape ou Desfazer desfaz esse agrupamento temporário; as peças continuam independentes no arquivo salvo. Redimensionar continua afetando apenas a estrutura. Não há seleção múltipla por arraste nesta etapa. Camadas ocultas/bloqueadas e limites da planta impedem operações inválidas; cada colagem é uma etapa de Desfazer. A cópia guardada permanece independente de alterações posteriores no original.

Validação: 110 testes e build aprovados. Interação de copiar/colar no navegador ainda pendente de conferência visual.

## Seleção múltipla na viewport

Na ferramenta Selecionar / mover, arraste em uma área vazia para marcar as peças inteiramente contidas no retângulo. Shift+arraste acrescenta à seleção; Shift+clique alterna uma peça. Camadas ocultas ou bloqueadas ficam fora da seleção por área. Portas e janelas acompanham suas estruturas, sem seleção por área independente.

Arrastar uma peça selecionada ou usar as setas move o conjunto. Ctrl+C/Ctrl+V copia o conjunto com vínculos próprios e elimina duplicações de equipamentos já incluídos pela sala. Escape libera o conjunto. Os contornos tracejados e o retângulo de seleção são exclusivos do editor e não entram nas imagens exportadas. Propriedades, redimensionamento e exclusão ainda atuam na peça ativa, não no conjunto inteiro.

Validação: 112 testes, formatação e build aprovados. Conferência de interação no navegador pendente.

## Duplicar e excluir conjuntos

Ctrl+D e Duplicar seleção copiam exatamente as peças selecionadas, incluindo as portas/janelas dependentes. Equipamentos não selecionados não entram automaticamente nesta operação. A cópia fica selecionada e procura uma posição próxima válida, inclusive um deslocamento maior quando a sobreposição remove o suporte das portas. Delete e Remover seleção apagam o conjunto e suas aberturas dependentes. Camadas bloqueadas impedem a operação inteira. Cada ação ocupa uma etapa de Desfazer.

Conferido no navegador local: seleção por retângulo de sala e três equipamentos; duplicação incluindo porta (13 para 18 objetos); remoção do conjunto (18 para 13); Desfazer restaurando os 18 objetos. Agrupamento persistente e rotação de seleção arbitrária permanecem nas próximas etapas.

## Grupos persistentes

Ctrl+G agrupa a seleção; Ctrl+Shift+G desagrupa. Os botões Agrupar seleção e Desagrupar ficam nas propriedades. É necessário selecionar ao menos duas peças além das aberturas dependentes. Clicar em qualquer integrante seleciona o grupo completo; arraste e setas movem o conjunto. Escape libera apenas a seleção, preservando o grupo salvo. Para editar integrantes separadamente, desagrupe primeiro.

Os grupos são salvos por identificador nas peças do arquivo .alien-map, mantendo compatibilidade com projetos sem grupos. Copiar ou duplicar gera identificadores independentes. Agrupar conjuntos já existentes reúne seus integrantes em um grupo único, sem hierarquia aninhada. Camadas ocultas/bloqueadas impedem alterações do grupo. Desfazer reverte agrupamento e desagrupamento. Rotação de grupos arbitrários permanece pendente.

## Rotação de conjuntos

Com uma seleção múltipla ou grupo ativo, R gira +90° e Shift+R gira −90° ao redor do centro da área ocupada pelo conjunto. Os botões Girar ±90° nas propriedades oferecem as mesmas ações. Salas retangulares e ovais trocam largura/altura e remapeiam seus trechos de parede e aberturas; polígonos, corredores e dutos giram seus pontos; equipamentos mantêm as dimensões e atualizam posição/rotação. Anotações mudam de posição, mantendo o texto horizontal.

Camadas ocultas/bloqueadas e posições fora da planta impedem a operação inteira. Cada giro ocupa uma etapa de Desfazer. Os vínculos e identificadores de grupos são preservados. Esta etapa usa giros de 90°; rotação livre por alça continua prevista para o bloco de transformações na viewport.

Validação automatizada: 118 testes e build aprovados, incluindo quatro giros completos, giro inverso, remapeamento de oval e portas, caminhos e limites da planta. Conferência visual fica para a próxima sessão do usuário.

## Paredes preservadas por padrão

Novos ambientes mantêm as paredes mesmo quando encostam ou se sobrepõem. A opção Unir paredes ao encostar ambientes permanece disponível nas propriedades, desativada por padrão; ativá-la restaura a união automática para aquele ambiente. Projetos existentes que já tinham essa opção ativa preservam sua escolha. Abertura livre continua removendo apenas o trecho escolhido; Automática restaura a parede padrão nesse trecho.

O preenchimento de piso até a abertura agora vale tanto para portas quanto para janelas. Arrastar uma abertura mostra sua posição prevista na parede durante o gesto. As peças de preenchimento das junções passaram a usar encontros retos, sem os discos que criavam saliências arredondadas; curvas próprias de salas e corredores permanecem. Conferência visual desses ajustes pendente.

## Regra visual dos comandos

Botões de ação nos painéis usam largura integral, altura mínima de 44 px, espaçamento uniforme e conteúdo alinhado à esquerda. Ações pareadas usam colunas iguais. Ícones vetoriais devem ser reutilizados de ToolIcon; ações de painel mantêm rótulos curtos, enquanto comandos familiares da viewport podem usar somente ícones com nome acessível e dica. Atalhos aparecem nas dicas. Evitar símbolos decorativos ambíguos, texto repetitivo e botões com largura determinada pelo comprimento da legenda. Botões com textos longos podem crescer em altura para não cortar o conteúdo no celular.

## Alças de redimensionamento na viewport

Salas retangulares, ovais e equipamentos sem rotação exibem oito alças: quatro cantos e quatro lados. Os cantos ajustam largura e altura; os lados ajustam apenas uma dimensão. A borda oposta permanece fixa. O arraste conserva o deslocamento inicial do clique, respeita os limites da planta e o tamanho mínimo de 0,25 m, sem inverter a peça.

A prévia acompanha o gesto; soltar aplica uma etapa de Desfazer e Escape cancela. Redimensionar uma sala altera somente sua estrutura, mantendo equipamentos nas posições e medidas originais; portas e janelas conservam o vínculo com as bordas e passam pela validação de aberturas existente. O painel continua disponível para ajustes numéricos. Polígonos e traçados mantêm edição por vértices. Equipamentos rotacionados e escala de grupos inteiros ficam para uma etapa posterior.

Próximos passos: conferir as oito alças com mouse no editor local; evoluir controles de rotação na viewport e redimensionamento de equipamentos rotacionados. Publicação deste bloco depende de autorização.

## Rotação por arraste e equipamentos girados

A alça circular dos equipamentos agora permite girar por arraste ao redor do centro, com prévia e precisão de um grau. Escape cancela; soltar registra uma etapa de Desfazer. As oito alças de tamanho acompanham a orientação do equipamento e alteram suas dimensões locais mantendo a borda oposta fixa. Transformações que ultrapassam a planta são recusadas. Os ajustes numéricos e atalhos de 90° continuam disponíveis.

Salas e grupos conservam rotação de 90°; rotação livre de estruturas depende de ampliar a representação geométrica e preservar os vínculos de paredes e aberturas. Conferência visual deste bloco ainda pendente.

### Feedback das transformações

Durante o arraste, o editor exibe largura/altura ou ângulo atual. Shift durante a rotação encaixa o ângulo em múltiplos de 15°. A rotação usa coordenadas contínuas do ponteiro, independente do magnetismo da grade; o redimensionamento mantém o encaixe existente. O indicador é exclusivo da interface e não entra na exportação. Validação: 126 testes, formatação e build; conferência visual pendente.

## Ações contextuais na viewport

Na ferramenta Selecionar, uma barra compacta aparece no canto inferior direito quando há uma peça ativa. Oferece girar equipamentos/conjuntos em ±90°, duplicar, agrupar, desagrupar e remover. Os botões usam ícones com nomes acessíveis e dicas dos atalhos; ações incompatíveis ficam desativadas. Após uma ação, o foco volta à planta para continuar usando os atalhos. Reutiliza as operações existentes, incluindo validação de camadas e Desfazer. A barra não entra nas exportações. Validação: 126 testes, formatação e build aprovados; avaliação visual pendente.

### Redimensionamento proporcional

Shift + arraste de um canto mantém a proporção original em salas retangulares, ovais e equipamentos, inclusive girados. O canto oposto permanece fixo. Nas alças laterais, Shift não altera o comportamento de uma dimensão. O indicador informa quando a proporção está ativa. A proporção tem prioridade sobre o encaixe individual de cada dimensão na grade. O tamanho mínimo e os limites da planta são respeitados sem deformar a peça; equipamentos internos continuam independentes. Validação: 128 testes, formatação e build aprovados; conferência visual pendente.

### Alça única nos equipamentos

Equipamentos exibem somente a alça de tamanho do canto inferior direito local, que acompanha a rotação do objeto. Isso reduz a sobreposição dos controles em peças pequenas. O controle de rotação permanece separado e Shift mantém a proporção durante o redimensionamento. Salas retangulares e ovais continuam com oito alças.

## Rotação livre de seleções — primeiro bloco

O campo de ângulo na barra contextual da viewport aplica giros de −360° a 360° em equipamentos, salas poligonais, corredores, dutos e anotações, individualmente ou em conjunto. O pivô é o centro dos limites da seleção. Portas/janelas dependentes conservam os segmentos e acompanham a geometria; textos permanecem horizontais. A operação preserva grupos, respeita limites e camadas bloqueadas e ocupa uma etapa de Desfazer.

O campo fica oculto em seleções contendo salas retangulares ou ovais: elas permanecem em giros de 90°, sem conversão silenciosa para polígonos. Rotação livre dessas estruturas e alça de arraste para conjuntos continuam pendentes. Conferência visual pendente; 130 testes, formatação e build aprovados. Desenvolvimento mantido local.

### Alça de rotação de conjuntos

Seleções com ao menos duas peças compatíveis exibem uma alça circular acima do conjunto. Arraste para girar com prévia; Shift encaixa em 15°, Escape cancela e soltar registra uma etapa de Desfazer. O pivô permanece no centro dos limites originais durante todo o gesto. Os controles individuais ficam ocultos enquanto a alça coletiva está disponível. Seleções contendo salas retangulares/ovais ou camadas ocultas/bloqueadas não oferecem essa alça. Transformações inválidas mostram o motivo e não são aplicadas. O campo Aplicar ângulo continua disponível. Validação: 131 testes, formatação e build aprovados; conferência visual pendente, sem publicação.

### Pivô ajustável do conjunto

Nas seleções compatíveis com a alça coletiva, o marcador em cruz permite arrastar o centro da rotação, com encaixe na grade quando ativo. A alça e Aplicar ângulo usam esse ponto. Centralizar pivô restaura o centro automático. Escape cancela o arraste do marcador. O pivô é um controle temporário do editor, não é salvo nem exportado; a transformação das peças continua persistida normalmente e pode ser desfeita. Os atalhos de giro rápido de 90° mantêm o comportamento anterior pelo centro da seleção. Validação: 132 testes, formatação e build; conferência visual pendente, sem publicação.

### Conversão explícita de retângulos

Converter salas em vértices, nas propriedades da seleção, transforma os retângulos selecionados em polígonos com quatro pontos na mesma ordem das paredes. Conserva IDs, grupos, trechos e vínculos de portas/janelas. Equipamentos permanecem independentes; selecione-os junto para girar o conjunto. Após converter, a sala usa edição por vértices em vez das oito alças retangulares e aceita Aplicar ângulo. Ctrl+Z restaura o retângulo. Salas ovais não são convertidas. Validação: 133 testes, formatação e build aprovados; conferência visual pendente, mantido local.

### Rotação individual de estruturas por pontos

Salas por vértices (incluindo retângulos convertidos), corredores e dutos agora exibem alça de rotação e pivô mesmo selecionados individualmente. Seus vértices continuam disponíveis; ao selecionar um conjunto, os controles individuais ficam ocultos. Aberturas acompanham a estrutura. Equipamentos mantêm seu controle individual anterior. Validação: 134 testes, formatação e build aprovados; conferência visual pendente, sem publicação.

### Histórico na viewport

A barra superior oferece Desfazer e Refazer com ícones próprios e dicas de teclado. Os botões ficam desativados quando não há histórico ou durante um gesto/traçado. Após clicar, o foco volta à planta. Restaurar o histórico limpa gestos e pivô temporários para evitar aplicar uma transformação iniciada sobre outro estado. Validação: 134 testes, formatação e build aprovados; conferência visual pendente.

## Bloco consolidado — rotação nativa de salas

Retângulos e ovais agora armazenam sua própria orientação e giram livremente sem conversão em polígonos. A alça individual gira somente a estrutura e suas aberturas; para levar equipamentos, selecione o conjunto. A rotação coletiva aceita esses ambientes, incluindo pivô personalizado e Aplicar ângulo. Dimensões permanecem locais à sala, as alças acompanham sua orientação e Shift mantém proporções. Em salas pequenas, alças intermediárias são ocultadas conforme o espaço disponível; equipamentos mantêm uma única alça.

Os índices de paredes permanecem estáveis nos giros livres. Portas/janelas, espessuras, arcos de ovais, máscaras de piso, cópia com equipamentos e arquivos salvos consideram a orientação. A seleção tracejada acompanha o objeto. Converter em vértices permanece opcional para editar cantos, sem ser necessário para girar.

Verificação: 140 testes e build aprovados; SVG renderizado com retângulo/oval girados e aberturas. No navegador local, conferidos giro de retângulo e oval por arraste, Desfazer/Refazer, salvar e reabrir com os ângulos preservados e download PNG. Captura: outputs/blueprint-native-rotation-verified.png. Desenvolvimento mantido local, sem GitHub/Vercel.


## Pavimentos — primeiro bloco

O seletor acima da viewport permite criar, renomear, duplicar e excluir pavimentos (até 20). Excluir exige confirmação e pode ser desfeito. Cada pavimento tem objetos independentes; duplicar remapeia IDs, grupos e vínculos de portas/janelas. Escala, dimensões e configurações de camadas são comuns ao projeto. Alterações de dimensões validam também os andares inativos. Mapas antigos continuam compatíveis e aparecem como Pavimento 1.

Salvar e recuperação local preservam todos os pavimentos; PNG/SVG exportam apenas o ativo com seu nome no arquivo. Operações de pavimento entram no histórico e ficam bloqueadas durante desenhos/gestos. Próximos blocos: referência visual de outro pavimento e conexões verticais (escadas/elevadores).


### Referência e conexões verticais

O painel recolhível Referência e conexões entre pavimentos permite sobrepor contornos de outro andar, com opacidade ajustável. A referência ignora seleção e é removida das exportações. Escadas e elevadores criam dois equipamentos de 2 × 2 m nas coordenadas indicadas, um em cada andar, ligados por IDs persistentes. Cada ponta admite transformações independentes. Ir para navega ao destino; Desvincular mantém os equipamentos. Excluir uma ponta/pavimento elimina o vínculo, preservando a outra peça. Duplicar pavimentos copia as peças sem duplicar vínculos verticais. Tudo fica no arquivo local e no histórico.


### Posicionamento de conexões na viewport

Selecione os destinos e use Posicionar no mapa: a prévia de 2 × 2 m acompanha o cursor e o clique define seu canto superior esquerdo, com encaixe na grade. Escape cancela; botões central/direito continuam movendo a visão. Coordenadas manuais permanecem disponíveis. Escadas ligam dois andares; elevadores aceitam vários destinos, com uma peça por parada e navegação entre todos eles. Excluir uma parada preserva as conexões entre as restantes. A criação completa ocupa uma etapa do histórico.


## Organização dos objetos

Objetos do pavimento, no painel direito, oferece busca, filtro por camada, seleção e controles individuais de ocultar/bloquear. Ocultos não entram na imagem exportada; ocultar uma sala esconde suas aberturas. Bloqueados permanecem visíveis e suas alterações/remoções são recusadas, inclusive em operações coletivas. Os estados são salvos, copiados e recuperados pelo histórico; arquivos antigos continuam visíveis e desbloqueados.


### Nomes, localização e alinhamento

Na lista de objetos, o lápis abre a edição do nome (até 80 caracteres; vazio restaura o nome automático) e o enquadramento centraliza a peça na viewport. Nomes persistem no projeto e participam da busca. Equipamentos selecionados em conjunto oferecem alinhamento por borda/centro nos dois eixos; três ou mais oferecem espaçamento uniforme entre limites visuais, incluindo rotação, mantendo as extremidades. Grupos parciais, peças bloqueadas/ocultas e distribuição sem espaço suficiente são recusados. Cada aplicação é uma etapa do histórico; medidas e ângulos permanecem intactos.


### Referências combinadas e módulos próprios

Referências agora usam checkboxes independentes; o pavimento ativo é excluído da sobreposição. A opacidade por andar é 0,35 / raiz quadrada da quantidade visível. Guias continuam fora da exportação. Meus módulos guarda seleções na sessão, com download/importação .alien-module. Inserção por clique remapeia IDs e vínculos de aberturas, preserva medidas e deixa a cópia selecionada. A biblioteca não é enviada ao servidor e deve ser baixada antes de fechar a sessão. Conexões entre pavimentos não são copiadas para módulos.


### Gestão da biblioteca de módulos

A biblioteca permite buscar por nome (ignorando acentos), renomear e conferir dimensões antes de inserir. Baixar biblioteca inteira gera .alien-library; importar aceita bibliotecas ou módulos individuais e acrescenta ao acervo da sessão, ignorando cópias exatamente iguais. Nomes iguais com conteúdo diferente são preservados. O limite é de 100 módulos e 20 MB por biblioteca; arquivo inválido é recusado por inteiro. Nenhuma publicação ou armazenamento remoto.


### Prévias dos módulos

Os cards mostram miniaturas esquemáticas das estruturas, aberturas e equipamentos. Ao inserir, o desenho acompanha o cursor e o contorno fica vermelho se ultrapassar a planta. A prévia não entra na exportação; espessuras e acabamentos finais continuam sendo calculados ao inserir.


### Giro antes da inserção

Durante o posicionamento, a barra da viewport oferece ±90° e Cancelar. R/Shift+R giram a cópia pendente; Escape cancela. A prévia acompanha a orientação, os vínculos de portas/janelas são remapeados e o módulo original da biblioteca permanece intacto. Somente a inserção entra no histórico do mapa.


### Inserção repetida

Inserção contínua na barra do módulo mantém a prévia após cada clique. Shift+clique faz o mesmo pontualmente. Cada cópia recebe IDs próprios e ocupa uma etapa do histórico. A orientação pendente permanece para as próximas cópias. Escape/Cancelar encerram a ferramenta sem remover o que já foi inserido. A lista de objetos fica desativada durante o posicionamento para evitar seleções conflitantes.


### Repetição em grade

Durante o posicionamento, Repetir em grade permite de 1 a 10 linhas/colunas e espaço entre bordas de 0 a 100 m. O clique insere o lote inteiro em uma etapa do histórico, com IDs independentes. Limites da planta e 3000 objetos são verificados antes de qualquer inserção. Acima de 500 peças previstas, a prévia usa contornos simplificados para reduzir o custo de desenho. Uma cópia restaura a inserção simples; selecionar outro módulo também reinicia a grade.


## Validação adiada pelo usuário — 23/10/2026

Checklist central: [validação pendente do criador de mapas](validacao-pendente-blueprints.md). O usuário está sem computador; a conferência visual fica para depois. Desenvolvimento local pode continuar. Última verificação automática: 164 testes, formatação e build aprovados. Não confundir esses resultados com aprovação visual ou autorização de publicação. Próxima frente: anotações e medidas.


### Anotações com formatação

A ferramenta Texto permite até 1000 caracteres, múltiplas linhas, tamanho de 0,25 a 20 m, alinhamento esquerda/centro/direita e negrito. Os mesmos controles aparecem nas propriedades. SVG usa linhas separadas com espaçamento de 1,25 vezes o tamanho; os estilos persistem em projetos e módulos. Arquivos antigos continuam compatíveis. Cotas de distância ficam para o próximo bloco.

### Cotas de distância

A ferramenta Cota de distância usa dois cliques e mostra a distância real entre os pontos em metros, inclusive na diagonal. As cotas pertencem à camada Anotações e são exportadas com ela. No modo Selecionar, arraste a linha para mover ou as extremidades para recalcular a medida. São objetos independentes: mover uma sala não desloca automaticamente uma cota fora do grupo selecionado.

### Mobiliário físico — família de comando

Bancada modular (2 × 1 m), terminal de bancada (0,60 × 0,45 m) e cadeira de operador (0,65 × 0,70 m) são peças independentes em vista superior. As bancadas podem ser duplicadas e encostadas lado a lado usando Guias; não há fusão automática. Os detalhes são desenhados nas dimensões da peça, com traço de espessura constante em metros. Os assets antigos permanecem compatíveis e mantêm suas dimensões iniciais anteriores. Para posicionar peças pequenas, use uma grade de 0,25 m ou Alt para suspender o encaixe.

O catálogo de equipamentos está organizado em categorias recolhíveis: Comando, Habitação e convivência, Medicina e criogenia, Engenharia, Carga e armazenamento, Acessos e circulação. A busca continua global e expande as categorias com resultados. A organização não altera objetos dos projetos existentes.

## Biblioteca de ambientes — 25/10/2026

24 peças físicas em vista superior, organizadas em Jardim e vegetação, Área externa e Decoração interna. Inclui vasos, árvore, canteiros, hidroponia, pedras, espelho d’água, bancos, mesa externa, ombrelone, proteção, iluminação, gabinete técnico, painel solar, antena, drenagem, tapete, vitrine e aquário. Os desenhos são SVG leves e determinísticos, sem imagens externas. As peças usam as ferramentas existentes de escala, rotação, agrupamento, módulos e exportação.
