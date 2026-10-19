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
- Retângulos, elipses e corredores por segmentos; curvas livres e polígonos arbitrários ficam para a evolução seguinte.
- Cruzamentos de dutos são visuais, sem simulação de conectividade ou passagem acima/abaixo.
- Dez assets SVG originais simples e três módulos (ponte, enfermaria e alojamento). O detalhamento visual será ampliado após feedback.
- Importação até 5 MB, 3000 objetos e 500 pontos por traçado; planta até 2000 × 2000 m. PNG até 4096 pixels no maior lado.
- Portas sobre paredes elípticas usam aproximação de 64 segmentos. Portas em quinas e encontros complexos precisam de conferência visual.

## Verificação

Testes de escala e serialização, ancoragem e movimento de portas, remoção dependente, módulos independentes, paredes de corredores e elipses e validação de importação. Renderização React estática e rasterização de um SVG de exemplo foram verificadas. Interação por ponteiro, teclado e download real ainda requerem validação em navegador conectado.

## Edição rápida

Selecione uma peça para duplicar (Ctrl+D), mover com as setas na grade ou girar equipamentos com R (Shift+R inverte). Shift+setas move dez passos. Os botões do painel também duplicam e giram. Os atalhos atuam com foco na área de desenho.

Duplicar uma sala ou corredor copia suas portas com vínculos próprios; os equipamentos internos continuam independentes e devem ser duplicados separadamente. Portas avulsas são inseridas pela ferramenta Porta. Camadas ocultas ou bloqueadas impedem a cópia das peças vinculadas. Desfazer reverte a duplicação inteira.


## Salas por vértices

Escolha Sala por vértices e clique nos cantos em sequência. Enter ou Concluir traçado fecha o contorno automaticamente, sem repetir o primeiro ponto. Backspace ou Remover último ponto corrige o traçado; Escape cancela. Salas em L e outros polígonos simples aceitam portas, movimento e duplicação. Contornos cruzados, pontos repetidos e salas sem área são recusados. Vértices de uma sala concluída ainda não podem ser arrastados individualmente.

