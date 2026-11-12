# Blueprint — importador experimental 0.2.3

Alvo: Foundry VTT 14. A importação básica foi validada pelo usuário. As novidades desta versão ainda precisam de conferência em uma sessão real.

## Gerar e instalar

Executar `node scripts/build-foundry-importer.mjs` na raiz do projeto. Copiar a pasta resultante `outputs/alien-blueprint-importer` para `Data/modules/alien-blueprint-importer`, reiniciar o Foundry e habilitar o módulo. O ZIP distribuído pelo editor contém essa mesma pasta.

No editor, abrir **Exportar → Foundry VTT 14 → Baixar para Foundry**. No Foundry, abrir **Configurações → Importar mapa Blueprint → Importar arquivo**, selecionar o `.alien-foundry`, conferir as contagens e confirmar.

Para mapas com conexões, habilitar a Suíte MÃE e seu recurso de acessos. Desabilitar o módulo legado `alien-acessos` para evitar conflito. Manter o importador ativo: ele sincroniza a abertura das partes de uma porta curva, por meio de um mestre conectado.

## O que é exportado

- Cenas com nome **Projeto - Pavimento**, preservando o nome definido para cada pavimento; por exemplo, **Cassino - Térreo**.
- Imagens e barreiras na mesma escala. As barreiras ficam no centro da espessura visual das paredes; portas e janelas acompanham esse alinhamento.
- Uniões de salas e corredores, incluindo cruzamentos e curvas. Portas curvas têm seus segmentos sincronizados.
- Escadas e elevadores com destinos vinculados aos UUIDs reais das regiões criadas.
- Uma cena exclusiva por rede de ventilação conectada, nomeada **Projeto - Pavimento - Ventilação N**. Sua imagem mostra apenas os dutos dessa rede, sem revelar o interior das salas. Entradas locais e conexões entre pavimentos recebem vínculos bidirecionais.

As camadas são exportadas completas; objetos individualmente ocultos permanecem ocultos. A passagem pela Suíte continua sujeita à autorização do mestre.

## Segurança da importação e limites

A importação cria cópias novas, fora da navegação, e não substitui cenas existentes. Cada cena recebe seu nível explicitamente, evitando o nível adicional “Andar”. As imagens ficam em uma pasta nova dentro do mundo. Em falha de envio, a mensagem identifica a pasta para limpeza manual. Em falha de criação de documentos, o importador tenta remover somente as cenas desta tentativa e informa os IDs se a remoção falhar.

Limites: 200 cenas, 128 MiB por arquivo, 8192 pixels por eixo e 32 milhões de pixels por imagem. Reduzir a resolução se necessário. A área de chegada deve ser conferida para o tamanho dos tokens e obstáculos do cenário; o posicionamento automático não garante espaço livre em qualquer mapa.

## Conferência conjunta no Foundry

Atualizar o módulo para 0.2.2 e exportar novamente o projeto. Conferir nomes, ausência do nível extra, escala, visão e colisão no centro das paredes; abrir e fechar portas curvas; percorrer uniões de corredores; testar ida e volta em escadas, elevadores e ventilação com mestre e jogador. Na ventilação, confirmar que redes desconectadas ficam em cenas diferentes, sem revelar interiores de salas.

Os 41 testes automatizados verificam geometria, nomes, destinos, sincronização e falhas com runtimes simulados. Uma exportação real no navegador foi validada com quatro cenas, 119 barreiras e dez acessos. Isso não substitui a conferência das novidades no Foundry real. A disponibilidade no site público depende de publicação.

## Atalhos de importação (0.2.3)

O mestre pode abrir o importador pelo ícone de arquivo com seta nas ferramentas de Tokens, na barra lateral esquerda. Também há o botão Blueprint no cabeçalho da aba Cenas, disponível mesmo sem cena ativa. Ambos abrem o mesmo fluxo de seleção e confirmação; as configurações continuam disponíveis.
