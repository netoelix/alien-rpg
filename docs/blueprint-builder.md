# Criador de plantas — primeira versão

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
