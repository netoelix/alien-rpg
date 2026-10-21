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
