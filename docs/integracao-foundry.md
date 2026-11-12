# Integração Foundry — contrato inicial

## Barreiras no centro visual da parede

O exportador agora desloca as barreiras pela metade da espessura visível da parede, para permitir enxergar seu desenho pelo lado interno. O deslocamento ocorre depois dos recortes de portas/janelas e da união de salas; os pontos compartilhados são reconectados, com interseção de linhas nas quinas e limite de prolongamento. Divisórias independentes permanecem no eixo original. Imagens e projetos não são modificados. É necessário exportar um novo `.alien-foundry` e importar uma nova cópia para receber as coordenadas atualizadas. Testes específicos verificam espessura, alinhamento de portas/janelas, quinas, salas giradas, elipses e corredores em L. União envolvendo corredores e sincronização de portas curvas continuam como pendências separadas.

## Correção 0.1.1 — nível vazio "Andar"

O Foundry 14 cria um nível padrão quando `Scene.create` recebe uma cena sem níveis. O importador passou a enviar o nível com nome e imagem junto à criação da cena, usando depois o ID retornado para paredes, regiões e nível inicial. Isso evita o nível vazio adicional. Os testes simulam agora esse comportamento automático do Foundry. Cenas importadas anteriormente não são alteradas pela atualização; a correção vale para novas importações, inclusive usando o mesmo arquivo `.alien-foundry`.

## Alvo

Foundry 14.369, sistema alienrpg 4.1.18, Suíte MÃE 0.4.1. Importação futura em cenas novas, sem substituir documentos existentes. Exportação local, sem credenciais ou envio de mapas ao site.

## Primeiro bloco implementado

`src/blueprints/foundry/package.js` prepara todos os pavimentos, incluindo o snapshot do pavimento ativo, escala em pixels por metro, geometria original e rede bidirecional de acessos. Escadas e elevadores usam o centro da peça e seu retângulo rotacionado; ventilação usa a posição exata da escotilha. Elevadores compartilham uma região por parada com múltiplos destinos.

O primeiro contrato usava `stage: connection-plan`; atualmente usa `stage: barrier-plan`. NÃO é um Scene JSON importável nem a exportação final. Nenhum botão público foi adicionado enquanto faltar geometria física e imagens.

Depois de criar as cenas e regiões, o importador deverá passar seus UUIDs reais para `resolveAccessFlags`. A função rejeita regiões ausentes, duplicadas e destinos inválidos, e gera `flags.alien-suite-mae.access = { enabled: true, auto: true, targets: [...] }`. `auto` abre a solicitação de passagem; não dispensa autorização do mestre. Não gerar também comportamento nativo de teletransporte, para evitar disparos duplicados.

## Próximos blocos

1. Converter paredes resolvidas, curvas, quinas e recortes de portas/janelas. Paredes visuais e barreiras físicas são conceitos diferentes. Usar um único fator de escala para imagem e geometria; padding e offset do Foundry precisam ser considerados.
2. Gerar imagem de cada pavimento e decidir a representação separada da ventilação: seus acessos já são preservados, mas ainda não são cenas exclusivas de dutos. Não permitir divulgação acidental do interior completo ao jogador na ventilação.
3. Implementar importador GM com prévia das cenas, contagens, versão e avisos; criar cenas inicialmente sem navegação e acessos desativados, resolver todos os destinos e só então habilitar os acessos. Em falha, identificar exclusivamente os documentos criados nesta execução; nunca remover dados anteriores.
4. Permitir revisão da área de chegada: centro precisa estar livre para o tamanho do token. Não afirmar que isso está garantido pelo retângulo do asset.
5. UI de exportação e pacote de instalação do importador; reimportação inicialmente cria cópia explícita, sem sobrescrever.
6. Validar Foundry real com mestre/jogador: ida/volta, elevador com três paradas, duto, portas, janelas, bloqueios e escala; incluir mapas circulares, corredores curvos e paredes compartilhadas.

## Validação deste bloco

Três testes automatizados: elevador de três paradas e troca de pavimento ativo; escotilha fora do meio do duto; projeto legado sem vínculos e escala inválida. Conferido o formato de flags no código local da Suíte MÃE. Não testado ainda em uma sessão real do Foundry. Nenhuma publicação nesta etapa.

## Segundo bloco — barreiras físicas (05/11/2026)

Cada cena contém `geometry: {barriers, ready, warnings}` e o pacote usa `stage: barrier-plan`. Barreiras usam coordenadas em pixels, sem IDs do Foundry, comportamento semântico (movimento/visão/luz/som), estilo e ID de origem. Portas começam fechadas; blindagem não implica trancamento. Janelas/vidro transmitem visão e luz e bloqueiam movimento. Sem conversão automática de assets decorativos em colisão.

Recortes de abertura substituem o segmento da barreira. Paredes contíguas coincidentes são resolvidas pelo mesmo resolvedor do desenho. Curvas de corredores são subdivididas; paredes elípticas usam os 64 segmentos do modelo, sem mudar o projeto original. Corredores fechados mantêm continuidade nas quinas.

Limitações deste segundo bloco, parcialmente resolvidas no terceiro: ambientes `joinWalls` exigiam união geométrica e retornavam `ready:false`, sem barreiras parciais. Portas em vários segmentos exigem sincronização no Foundry e continuam pendentes. A precisão de elipses muito grandes deve ser revista antes da liberação. Não disponibilizar importação definitiva enquanto alguma cena retornar `ready:false`; não usar apenas `warnings` do pacote, pois cada cena também tem avisos próprios.

Seis testes adicionais aprovados (nove no conjunto Foundry): recorte de porta, vidro/janelas, parede aberta e compartilhada, salas giradas/elipses fechadas, continuidade de corredor curvo e rejeição explícita de uniões ainda não suportadas. Validação no Foundry real, imagens, adaptador de dados nativos e importador continuam pendentes.

## Terceiro bloco — adaptador e núcleo do importador (05/11/2026)

Conferidos os schemas locais do Foundry 14: imagem em `Level.background.src`, `Scene.initialLevel`, paredes com coordenadas inteiras e níveis explícitos, regiões poligonais e constantes de bloqueio. `importer.js` prepara documentos nativos e recebe um runtime injetado, sem acessar automaticamente um mundo real. Exige GM, geração 14 e acessos da Suíte habilitados quando houver conexões.

A pré-validação percorre todos os pavimentos, imagens, barreiras e destinos antes da primeira criação. Imagens precisam já estar no armazenamento do Foundry; upload e interface ainda serão implementados. Cria cenas novas fora da navegação, níveis e regiões inicialmente desabilitadas. Somente depois resolve os UUIDs retornados e habilita os vínculos. Em falha, tenta remover exclusivamente as cenas criadas nesta operação; se a remoção falhar, informa seus IDs para limpeza manual. Não há sobrescrita de cenas existentes.

Uniões de salas retangulares, polígonos e elipses agora recortam os trechos internos e eliminam a divisória entre salas unidas. Paredes de vizinhos sem união são preservadas. União envolvendo corredores continua bloqueada até tratar o contorno preenchido de suas curvas. Acessos de ventilação também são recusados pelo importador enquanto faltar a representação exclusiva dos dutos.

16 testes automatizados aprovados no conjunto Foundry, incluindo simulação do ciclo de criação, destinos bidirecionais, falha com remoção, validação sem escrita e uniões adjacentes/sobrepostas. A simulação não substitui teste no Foundry real. Restam imagens/pacote final, upload, instalação/interface, portas curvas, uniões com corredores e validação mestre/jogador.

## Quarto bloco — pacote com imagens

`archive.js` monta um único JSON `.alien-foundry`, `stage: image-package`, com PNG em data URL por pavimento. Remove os snapshots de elementos do arquivo final; mantém barreiras, acessos, escala e metadados. `render.jsx` usa o próprio `Drawing` para gerar SVG, remove marcações do editor e rasteriza para PNG no navegador. A função de download só executa depois de concluir todos os pavimentos; ainda não está ligada a um botão público.

Todos os pavimentos usam exatamente o mesmo fator pixels/metro. Dimensões fracionárias em pixels são recusadas para evitar distorção entre imagem e geometria. Limites iniciais: 8192 pixels por eixo e 32 milhões de pixels por imagem; geração sequencial, liberação do canvas e revogação de URLs temporárias. Camadas são exportadas visíveis e opacas, independentemente do estado de visualização do editor; objetos individualmente ocultos permanecem ocultos. PNGs ficam incorporados ao arquivo, sem URLs remotas. O importador ainda precisa validar/decodificar essas imagens e enviá-las ao armazenamento do Foundry antes de criar as cenas.

19 testes passam no conjunto Foundry. Os três novos testes verificam snapshots/escala, falha antes de renderizar projetos incompletos ou grandes demais e rejeição de resultado parcial. Esses testes injetam o rasterizador; não verificam PNG real. O renderizador real foi compilado com Vite e gerou SVG de sala com sucesso. Rasterização no navegador e inspeção visual ainda pendentes, assim como instalação/interface, upload, portas curvas, união com corredores e ventilação.

## Quinto bloco — recepção, upload e módulo experimental

`receive.js` lê o pacote com limite de 128 MB, verifica unicidade e dimensões das imagens, assinatura PNG/IHDR, escala e barreiras. O runtime decodifica todos os PNGs antes da primeira escrita. URLs externas e caminhos de arquivos enviados no pacote não são utilizados. Upload usa nomes internos sequenciais em pasta nova por execução, dentro do mundo atual, via `CONFIG.ux.FilePicker` do Foundry 14. Só após todos os envios começa a criação de cenas.

`runtime.js` implementa o adaptador real para Foundry, com liberação de bitmaps e confirmação do caminho retornado pelo upload. `module-entry.js` registra um menu restrito ao mestre, seleção de arquivo e confirmação com contagem de cenas/barreiras/acessos; impede execuções concorrentes no mesmo cliente. O módulo não depende da Suíte para mapas sem conexões; para conexões, exige Suíte ativa, recurso de acessos habilitado e módulo legado desativado.

Build do módulo: `node scripts/build-foundry-importer.mjs`, saída `outputs/alien-blueprint-importer`. Há manifest 0.1.0 experimental e instruções de instalação. Nenhum módulo foi instalado automaticamente e nenhum mundo foi modificado. Arquivos enviados podem permanecer em caso de falha; a pasta é informada para limpeza manual, sem apagar arquivos preexistentes.

25 testes aprovados: os seis novos cobrem leitura PNG, dimensões, imagens duplicadas, caminhos externos, falhas de decodificação/upload, acesso GM e assinatura do FilePicker/liberação de bitmap. O módulo foi compilado com Vite. Ainda falta validação no Foundry real e da interface, rasterização real dos PNGs, botão no site e os casos de geometria já registrados.

## Sexto bloco — exportação disponível para teste local

O painel **Exportar** mantém a exportação de imagem e acrescenta **Foundry VTT 14 · experimental**, com resolução de 20–100 pixels/metro, progresso, mensagens de bloqueio e download do módulo em ZIP. O renderizador é carregado sob demanda. A opção de teste está no editor local; ainda não houve publicação no Vercel.

Validação real no navegador em 05/11/2026: abriu projeto de dois pavimentos, gerou PNGs de 1000 × 800 e baixou `Teste-Foundry.alien-foundry` (54.246 bytes). O leitor validou duas cenas, dez barreiras e dois acessos bidirecionais. PNG do primeiro pavimento foi inspecionado visualmente (sala, porta e elevador). Validação no mundo Foundry fica para o usuário; não foi feita instalação nem criação de cenas no mundo.

Para atualizar o ZIP após mudanças no módulo: executar `node scripts/build-foundry-importer.mjs` e compactar a pasta `outputs/alien-blueprint-importer` em `public/downloads/alien-blueprint-importer.zip`, preservando a pasta raiz do módulo.

## Sétimo bloco — integração ampliada (11/11/2026), módulo 0.2.0

A importação básica foi confirmada pelo usuário. O nível extra “Andar” foi corrigido criando o Level junto com a cena. Barreiras agora seguem o centro da espessura visual da parede, incluindo portas e janelas.

Uniões com corredores usam contornos preenchidos, incluindo setores de curvas e cruzamentos. Portas que ocupam múltiplos segmentos recebem um grupo; o hook updateWall sincroniza seu estado no cliente do primeiro GM ativo, com proteção contra recursão. O módulo precisa permanecer habilitado.

Cada rede de ventilação conectada gera uma cena exclusiva, com imagem somente dos dutos da rede. Entradas locais ligam o pavimento à rede; conexões entre pavimentos ligam as respectivas cenas de ventilação. A chegada é deslocada para o interior quando possível, mas continua exigindo revisão para o tamanho do token e obstáculos.

Nomes de cenas seguem `Projeto - Pavimento`; redes recebem o sufixo ` - Ventilação N`. Os nomes originais do projeto não são alterados. Limites do pacote: 200 cenas e 128 MiB, além dos limites de imagem já documentados.

38 testes Foundry aprovados. Exportação real no navegador: `Validação-Foundry-0-2.alien-foundry`, quatro cenas, 119 barreiras, dez acessos e sete segmentos de porta curva; imagens e vínculos passaram pelo leitor do pacote. A imagem da ventilação foi inspecionada e contém apenas a rede. Próxima validação do usuário: importar com módulo 0.2.0 e testar conjuntamente portas curvas, corredores, ventilação, destinos e visão mestre/jogador. Nenhuma publicação nem alteração automática de mundo nesta etapa.

## Ajustes 0.2.1 — aberturas nas quinas e ventilação por pavimento

O recorte retangular de portas/janelas podia atingir paredes perpendiculares na extremidade. O exportador agora verifica a direção de apoio antes de recortar; aberturas elípticas preservam a variação de tangente. Teste de regressão cobre porta e janela de largura total no corredor.

Todos os dutos de um pavimento compartilham uma cena de ventilação, preservando as barreiras calculadas por rede e os vínculos individuais. Nomes seguem Projeto - Pavimento - Ventilação. O mapa Cassino Meia Lua passou na pré-validação a 50 px/m com duas cenas e 56 acessos. A correção anterior também descarta paredes reduzidas a um ponto pelo arredondamento; portas/janelas colapsadas continuam exigindo maior resolução.

41 testes passaram; builds do site e módulo 0.2.1 concluídas. Reexportar e reimportar para conferir visualmente no Foundry; nenhuma publicação nesta etapa.

## Ajuste 0.2.2 — redes de ventilação isoladas

Por decisão do usuário após teste de dutos sobrepostos, restaurada uma cena por rede conectada. Compartilhar a cena impunha bloqueios entre redes que se cruzam sem conexão. Preservados os acessos individuais e a correção das aberturas nas quinas. 41 testes aprovados e builds do site e módulo atualizadas; reexportação necessária. Sem publicação nesta etapa.
