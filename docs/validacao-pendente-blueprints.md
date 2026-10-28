# Conferência visual pendente — criador de mapas

Registro: 23/10/2026.

O usuário está sem acesso ao computador. Estas verificações ficam para depois e não bloqueiam o desenvolvimento local. Não marcar itens como concluídos apenas porque os testes automatizados passaram.

## Estado conhecido

- Última publicação: PR #63, incluindo pavimentos, conexões e organização inicial dos objetos; deploy confirmado no Vercel.
- Bloco local posterior: nomes/localização/alinhamento, referências combinadas, biblioteca de módulos, posicionamento avançado e formatação das anotações.
- Última verificação automática: 168 testes aprovados, formatação e build aprovadas (24/10/2026).
- Publicação deste bloco local ainda não realizada.

## Preparação

Use uma planta de teste ou uma cópia de um projeto salvo. Prepare três pavimentos, uma sala com equipamentos, uma porta e uma janela. Mantenha os arquivos originais guardados.

## Objetos e alinhamento

- [ ] Renomear um objeto, encontrá-lo pela busca e confirmar o nome após salvar/reabrir.
- [ ] Usar Localizar em objetos distantes, equipamentos girados e portas: a viewport deve centralizar a peça.
- [ ] Selecionar dois equipamentos e testar alinhamento por bordas e centro nos dois eixos.
- [ ] Selecionar três equipamentos de tamanhos diferentes, incluindo um girado, e distribuir: os espaços entre bordas devem ser iguais.
- [ ] Confirmar que peças ocultas/bloqueadas não são alteradas; desfazer e refazer uma organização.

## Sobreposição de pavimentos

- [ ] Marcar dois ou mais pavimentos de referência simultaneamente.
- [ ] Confirmar que a transparência se ajusta e que o pavimento ativo não aparece como referência de si mesmo.
- [ ] Alternar de pavimento e desmarcar referências sem afetar os desenhos.
- [ ] Exportar PNG/SVG e confirmar que os guias de referência não aparecem.

## Biblioteca de módulos

- [ ] Guardar uma sala retangular com equipamentos internos, porta e janela; conferir miniatura, nome e dimensões.
- [ ] Guardar uma seleção de várias peças, incluindo salas de outros formatos com equipamentos selecionados explicitamente.
- [ ] Buscar e renomear módulos.
- [ ] Inserir o módulo em outra planta e confirmar geometria, equipamentos e vínculos das aberturas.
- [ ] Alterar uma cópia e confirmar que o módulo da biblioteca e outras cópias permanecem independentes.
- [ ] Baixar um módulo .alien-module e importá-lo novamente.
- [ ] Baixar a biblioteca .alien-library, recarregar a página e importá-la: todos os módulos devem voltar.
- [ ] Importar a mesma biblioteca duas vezes: cópias exatamente iguais não devem duplicar.
- [ ] Salvar/reabrir o projeto do mapa e confirmar as peças inseridas. A biblioteca é separada e dura somente a sessão.

## Posicionamento de módulos

- [ ] Conferir a prévia acompanhando o cursor e o encaixe na grade.
- [ ] Girar por botões e R/Shift+R antes de inserir; portas, janelas e equipamentos devem acompanhar.
- [ ] Confirmar que o giro pendente não modifica o original da biblioteca.
- [ ] Levar a prévia para fora da planta: indicação vermelha e recusa da inserção.
- [ ] Cancelar com Escape e pelo botão sem criar objetos.
- [ ] Usar Inserção contínua e Shift+clique; cada cópia deve ser independente.
- [ ] Encerrar a inserção contínua sem apagar as cópias já criadas.
- [ ] Criar uma grade de 2 linhas por 3 colunas, com espaçamento de 2 m; conferir quantidade, posição e espaços.
- [ ] Desfazer/refazer o lote inteiro em uma ação.
- [ ] Testar Uma cópia e escolher outro módulo: a grade deve voltar a 1 × 1.
- [ ] Exportar PNG/SVG e confirmar que prévias, controles e contornos de seleção não entram na imagem.

## Usabilidade

- [ ] Conferir os painéis em tela larga e estreita, sem sobreposição de botões/campos.
- [ ] Conferir o painel Repetir em grade na viewport e os campos numéricos.
- [ ] Mover a visão com botão central/direito durante o posicionamento.

## Próxima frente local

Anotações e medidas: nomes de ambientes, ajustes de texto e cotas de distância. Manter esta checklist aberta durante os próximos blocos. Ao relatar um problema, registrar o passo, resultado observado e uma captura se possível.

## Anotações — novo bloco

- [ ] Criar texto com várias linhas; ajustar tamanho, esquerda/centro/direita e negrito.
- [ ] Editar texto existente; salvar/reabrir e exportar PNG/SVG.
- [ ] Guardar uma anotação em módulo e conferir a prévia e a cópia inserida.

Cotas de distância implementadas no bloco seguinte; conferir a seção específica abaixo.

## Cotas de distância

- [ ] Usar Cota de distância: clicar no início e no fim; conferir medida horizontal, vertical e diagonal.
- [ ] Arrastar a cota e suas extremidades; conferir atualização em metros.
- [ ] Cancelar com Escape; desfazer/refazer, copiar e salvar/reabrir.
- [ ] Ocultar Anotações e exportar PNG/SVG; confirmar que medidas seguem a camada e prévias não aparecem.
- [ ] Incluir uma cota em módulo, girar e inserir; conferir medida preservada.

## Refinamento de cotas e textos

- [ ] Alternar distância direta, largura horizontal e altura vertical.
- [ ] Selecionar a cota e arrastar o ponto amarelo central: somente a linha da medida deve afastar, mantendo os pontos originais.
- [ ] Ajustar afastamento positivo/negativo pelo painel e conferir salvar/reabrir e exportação.
- [ ] Selecionar texto nas áreas vazias entre linhas, testar alinhamento e seleção por caixa.

## Retorno da conferência do usuário — 24/10/2026

Usuário confirmou os demais itens funcionando. Duas exceções reportadas: importação da biblioteca de módulos e alcance da rolagem com seções abertas. Corrigido o botão para usar o importador de biblioteca/módulo com deduplicação; painel direito passa a acompanhar a rolagem da página, sem altura limitada. Revalidar estas duas correções.

## Paredes independentes e pontas de corredores

- [ ] Editar paredes → Desenhar parede independente: criar divisórias de cada tipo, mover extremidades e colocar portas/janelas.
- [ ] Selecionar corredor e marcar Fechar início / Fechar fim; confirmar que o piso não ultrapassa a ponta fechada.
- [ ] Colocar aberturas nas pontas; reabrir uma ponta e conferir aviso, cancelamento e preservação das aberturas da outra ponta.
- [ ] Salvar/reabrir, desfazer/refazer e exportar as novas estruturas.

## Guias e encaixe em objetos

- [ ] Desenhar paredes, salas e cotas próximo de quinas, centros e extremidades; conferir guias amarelas.
- [ ] Mover estruturas/equipamentos e grupos por pontos diferentes: o encaixe deve alinhar suas bordas, não somente o cursor.
- [ ] Segurar Alt para movimento/desenho livre; testar Guias e Grade independentemente.
- [ ] Objetos/camadas ocultos não devem gerar guias; conferir tolerância com zoom.
- [ ] Exportar sem guias na imagem.

## Primeira família de mobiliário físico

- [ ] Buscar Bancada modular, Terminal de bancada e Cadeira de operador e conferir dimensões iniciais.
- [ ] Encostar duas bancadas lado a lado e colocar um terminal sobre elas.
- [ ] Girar e redimensionar: conferir traço, seleção e prévia dos módulos.
- [ ] Salvar/reabrir e exportar PNG/SVG; comparar os objetos antigos para confirmar preservação.

## Prévia de inserção

- [ ] Escolher equipamento e conferir tamanho/posição antes do clique; testar fora dos limites.
- [ ] Escolher porta/janela e conferir encaixe na parede, ajuste próximo às quinas e indicação vermelha sem suporte.
- [ ] Sair da viewport: prévia desaparece. Conferir que ela não aparece na exportação.
- [ ] Repetir no mapa Teste para conferir desempenho após as otimizações.

## Ventilação — acessos e desenho
- Conferir duto com curvas, largura e juntas transversais.
- Terminar na parede: grelha; dentro da sala: escotilha; fora: ponta aberta.
- Selecionar o duto e alterar Início/Fim entre automático, grelha, escotilha, aberto e tampado.
- Salvar/reabrir e exportar somente ventilação; conferir também miniatura do módulo.
- Nesta etapa os acessos são recalculados pela posição. Ainda não há vínculo persistente que arraste o duto ao mover a sala, nem junções automáticas entre dutos ou pavimentos.

### Junções de ventilação
- Terminar um duto no eixo de outro: conferir junção em T e ponta sem escotilha.
- Cruzar dois trajetos sem terminar no encontro: manter sobreposição independente.
- Definir ponta como tampada/grelha/aberta: não conectar automaticamente.
- Mover uma ponta para longe desfaz a conexão. Conferir exportação e módulos.
- Vínculo persistente às paredes e conexões entre pavimentos continuam pendentes.

### Grelhas acompanhando paredes
- Mover, girar e redimensionar uma sala com duto terminando na parede: conferir a ponta durante o gesto e ao soltar.
- Salvar/reabrir e repetir; duplicar sala e duto juntos e mover a sala copiada.
- Mover o próprio duto tem prioridade; escotilhas permanecem livres. Excluir a sala mantém o duto no lugar.
- A ligação é reconhecida pela geometria (proximidade até 0,3 m), sem IDs extras no arquivo. Não rearranja automaticamente o restante do trajeto.

## Acabamentos internos — conferir localmente

- Selecionar sala e abrir Acabamento do piso: comparar os quatro estilos, escala e intensidade.
- Redimensionar/rotacionar, testar sala circular, polígono e corredor; conferir contornos e paredes.
- Inserir sinalização de piso e depois equipamentos; as marcações devem ficar abaixo deles.
- Salvar/reabrir, copiar e inserir como módulo.
- Exportar PNG/SVG com Estrutura (pisos) e Equipamentos (sinalização), incluindo paletas azul e impressão.

## Plataformas e desníveis
- Inserir as seis peças da categoria Plataformas e desníveis; redimensionar e girar.
- Conferir seta de subida e lado baixo da borda.
- Inserir uma plataforma depois de um móvel e confirmar que fica abaixo dele.
- Agrupar plataforma e móveis para mover juntos.
- Salvar/reabrir, biblioteca de módulos e exportação PNG/SVG.

## Traçados e entretenimento
- Desenhar trilhos com curvas e uma borda, inverter o lado baixo.
- Mover vértices, inserir/remover pontos e salvar/reabrir.
- Copiar como módulo e exportar PNG/SVG com Equipamentos.
- Conferir os 16 assets novos nas três categorias.


### Regiões de piso e acabamentos técnicos — 26/10/2026

- [ ] Desenhar duas regiões em uma sala; conferir que não aparecem paredes e que equipamentos ficam por cima.
- [ ] Comparar chapas, grelha, piso antiderrapante e painéis técnicos, variando escala e intensidade.
- [ ] Mover e editar vértices, inclusive inserir um vértice na última aresta; desfazer/refazer.
- [ ] Salvar/reabrir, copiar como módulo e exportar PNG/SVG.
- [ ] Conferir que ocultar Estrutura oculta também regiões; verificar acabamentos antigos.


### Revisão de assets e trilhos — 26/10/2026

- [ ] Sobrepor árvore, pedra, veículo e sofá curvo a um piso marcado; corpos sólidos devem ocultá-lo.
- [ ] Conferir cabine sanitária, chuveiro, guarita e barraca aberta.
- [ ] Comparar trilho modular e desenhado, com retas/curvas e temas diferentes; conferir PNG/SVG.
- [ ] Reabrir mapa anterior e verificar posição/escala dos assets.

## Conferência atual consolidada — após a última validação do usuário (26/10/2026)

Ponto de referência: o usuário testou a versão publicada com o catálogo consolidado e informou que parecia tudo funcionar. As listas históricas acima ficam como registro; não representam uma solicitação de repetir toda a validação. Desde esse retorno, as pendências visuais são:

- [ ] Regiões de piso: desenhar áreas dentro de uma sala, combinar acabamentos, alterar módulo/intensidade, editar vértices e conferir ausência de paredes novas.
- [ ] Padrões antiderrapante e painéis técnicos, além dos acabamentos anteriores; conferir que paredes e equipamentos permanecem por cima.
- [ ] Preenchimento dos assets revisados: árvore, plantas, pedras, veículos, balcão em L e sofá curvo sobre um piso marcado; partes sólidas ocultam o fundo, vãos reais permanecem abertos.
- [ ] Consistência de cabines sanitária/banho com vaso e chuveiro avulsos; guarita, barraca de feira e espessura dos contornos.
- [ ] Trilho desenhado versus asset modular: dormentes, espessura dos trilhos, curvas, seleção e temas. Conferir também borda de desnível para regressões.
- [ ] Salvar/reabrir um mapa anterior e um novo; preservar posições, dimensões, regiões e padrões. Testar módulos, desfazer/refazer e PNG/SVG.

Última verificação técnica registrada: 203 testes e build aprovados antes deste registro. Isso não substitui a conferência visual do usuário. Nenhuma build ou publicação foi executada para atualizar esta lista.

Ainda planejados, portanto não disponíveis para conferir: canaletas e novos detalhes de inspeção; ventilação contextual e acessos intermediários; conexões de ventilação entre pavimentos; piscinas, lagos e rios. Acrescentar seus testes quando implementados.

### Acrescentar à conferência atual: canaletas e inspeção

- [ ] Traçados: escolher Canaleta com tampas e Canaleta gradeada; conferir largura inicial de 0,4 m, curvas, junções visuais e densidade dos detalhes.
- [ ] Alterar largura e editar/adicionar/remover vértices; mover, duplicar e desfazer/refazer.
- [ ] Equipamentos → Piso · inspeção e drenagem: conferir as seis peças, escala, rotação e sobreposição sob móveis.
- [ ] Salvar/reabrir, biblioteca de módulos e exportar PNG/SVG com Equipamentos ativado/desativado; conferir temas.
- [ ] Montar uma região gradeada com tampas e canaletas, verificando legibilidade sem interferir em paredes/portas.

Testes automatizados: 205 aprovados. Build e publicação não executados neste bloco, conforme solicitado. A conferência visual interativa continua pendente.

### Acrescentar à conferência atual: ventilação contextual

- [ ] Desenhar duto atravessando vazio, sala e corredor: estrutura completa fora, tracejado sem preenchimento dentro, sem apagar móveis.
- [ ] Repetir com sala circular, por vértices e rotacionada; mover sala/duto e conferir atualização.
- [ ] Conferir grelhas e escotilhas existentes discretas; junções entre dutos e cruzamentos independentes.
- [ ] Exportar somente Ventilação em PNG/SVG: rede completa, fundo opaco e dimensões idênticas ao pavimento. Exportação combinada deve manter tracejado contextual.
- [ ] Salvar/reabrir mapa antigo, trocar pavimento, ocultar/exibir camadas e verificar módulos.

207 testes aprovados e imagem renderizada inspecionada. Nenhuma build/publicação neste bloco. Acessos intermediários e conexões verticais ainda não implementados.

### Acrescentar à conferência atual: acessos intermediários de ventilação

- [ ] Selecionar duto e expandir Acessos intermediários. Adicionar três acessos clicando no trajeto; testar clique fora e cancelamento com Escape/botão.
- [ ] Alternar direita/esquerda, grelha/teto/piso, nome/destino e posição percentual por trecho. Grelha não interrompe o duto.
- [ ] Mover duto/vértices, inserir e remover vértices; verificar acompanhamento dos acessos, desfazer/refazer.
- [ ] Remover somente um acesso e confirmar preservação do duto e demais acessos.
- [ ] Salvar/reabrir, copiar/colar e biblioteca de módulos.
- [ ] Comparar exportação contextual e somente ventilação: símbolos discretos versus completos, nomes na completa, alinhamento mantido.

210 testes aprovados e renderização inspecionada; validação interativa pendente. Sem build/publicação. Conexões verticais são o próximo bloco.

### Correções após retorno visual: curvas e saídas de ventilação

- [ ] Conferir quina do duto tracejado dentro da sala: as duas bordas devem continuar sem o grande vão reportado.
- [ ] Escotilhas de teto/piso acompanham a largura do duto; alterar largura e conferir extremidades e acessos intermediários.
- [ ] Grelha lateral: ajustar largura entre 0,2 e 3 m, mantendo lado/posição.
- [ ] Marcar Conectar à parede próxima com pequeno espaço entre duto e parede; conferir ramal e grelha na parede. Trocar lado, afastar parede além de 2 m e testar trecho de parede aberto.
- [ ] Mover sala/duto, salvar/reabrir e exportar somente ventilação e mapa combinado.

213 testes aprovados. Conferência visual interativa destas correções pendente; sem build/publicação.

### Extremidades de ventilação — ajuste após conferência

- [ ] Grelha e tampa nas extremidades devem ocupar toda a largura do duto, tanto no mapa contextual quanto na exportação exclusiva. A apresentação discreta reduz somente opacidade, não escala.

Removida redução para 65% que ainda afetava grelha e tampa. Regressão verificada em larguras de 0,5, 2 e 3 m; 15 testes de ventilação aprovados. Sem build/publicação.

### Acrescentar à conferência atual: ventilação entre pavimentos

- [ ] Criar escotilha de teto em um duto e escotilha de piso em outro pavimento; conectar pelas propriedades do acesso.
- [ ] Conferir o nome do destino nos dois andares e usar Ir ao destino; conferir seleção do duto correto.
- [ ] Mover dutos, editar nomes e salvar/reabrir: vínculo e destino devem permanecer corretos.
- [ ] Desvincular e confirmar preservação dos acessos; remover um acesso/duto/pavimento e conferir limpeza apenas da conexão.
- [ ] Duplicar pavimento ou copiar módulo: novas peças não devem herdar conexões externas.
- [ ] Exportar PNG/SVG de cada pavimento, somente Ventilação e combinado; conferir texto do destino e alinhamento.

Conexões usam acessos existentes, não posicionam saídas automaticamente. 217 testes aprovados; sem build/publicação. Verificação visual pendente.

### Acrescentar: nomes automáticos das saídas

- [ ] Nomear uma sala e posicionar grelha/escotilha nela; conferir Saída · nome da sala. Conferir também uma grelha com ramal até a parede.
- [ ] Ligar dois pavimentos: conferir nome do pavimento e sala do outro lado; renomear a sala e verificar atualização.
- [ ] Nome manual no acesso deve substituir o nome automático. Sem sala nomeada, não deve surgir nome inventado.
- [ ] Conferir textos no mapa e exportação, sem duplicação no modo completo.

219 testes aprovados; sem build/publicação. Conferência visual interativa pendente.

### Acrescentar: seleção sem deslocamento involuntário

- [ ] Com grade e guias ativadas, clicar em salas e equipamentos fora da grade: a posição deve permanecer idêntica, inclusive com pequenos tremores do mouse.
- [ ] Repetir com grupos, portas e janelas; selecionar não deve mover nem criar uma alteração para desfazer.
- [ ] Arrastar deliberadamente: conferir prévia, encaixe e desfazer; repetir com zoom aproximado e afastado.

O arrasto começa após 4 pixels de movimento na tela. 221 testes aprovados; sem build/publicação. Conferência visual interativa pendente.

### Símbolos e legendas de circulação

- [ ] Escadas: uma marca no início inferior e duas no patamar superior, acompanhando a rotação.
- [ ] Dutos: selecionar Teto e Chão tanto nos acessos intermediários quanto nas opções Início/Fim. Teto = quadrado com círculo; chão = quadrado com X. Escotilhas antigas mantêm o X.
- [ ] Textos longos de destinos: conferir quebra de linha e caixa em PNG/SVG.
- [ ] Com Selecionar/mover, arrastar diretamente uma caixa de texto. Só a legenda deve mover, com prévia; conferir desfazer, salvar e reabrir. Conferir legendas de escadas e de cada acesso do duto separadamente.
- [ ] Camadas/objetos bloqueados não devem permitir arrastar legendas.

223 testes aprovados e composição SVG renderizada e inspecionada. Interação no navegador pendente. Sem build/publicação.

### Água: piscinas, lagos e rios

- [ ] Região de piso / água → Acabamento → Água · piscina: desenhar pelo menos três pontos e Enter; verificar água opaca e borda dupla.
- [ ] Usar Água · lago: conferir o contorno suavizado, editar/inserir/remover vértices e ajustar tamanho/intensidade das ondas.
- [ ] Traçado → Rio / curso de água: desenhar vários pontos e Enter; ajustar largura e arredondamento. Curvas estreitas devem ser abertas para evitar dobras com rios muito largos.
- [ ] Mover, duplicar, desfazer/refazer, salvar e reabrir; conferir persistência da água. Salvar/colocar um módulo contendo água.
- [ ] Sobrepor equipamentos: devem permanecer acima da água. Piscina/lago não devem criar paredes ou aceitar portas.
- [ ] Exportar PNG/SVG e conferir piscinas/lagos com Estrutura e rios com Equipamentos. Conferir também outro tema de exportação.

226 testes aprovados; SVG renderizado e inspecionado. Interação no navegador pendente. Sem build/publicação. Regiões e rios não se unem automaticamente nesta primeira versão.

### Revisão visual da água — margens

Substituído o padrão de ondas em toda a superfície por contornos internos junto às margens. Lagos e rios têm um contorno contínuo e detalhes interrompidos; piscinas usam contornos regulares. Centro opaco e livre. O controle de escala passa a se chamar Detalhes da margem; intensidade continua ajustável nas regiões. Geometria salva e exportação preservadas. Renderização inspecionada; três testes de água aprovados.

- [ ] Conferir margens de piscinas, lagos e rios, inclusive trechos estreitos e polígonos côncavos.
- [ ] Variar tamanho/intensidade dos detalhes e exportar PNG/SVG; o centro deve continuar sem textura de ondas.

### Circulação externa — caminhos, calçadas e ruas

- [ ] Traçado: criar Caminho, Calçada e Rua; conferir larguras iniciais 1,5 / 2 / 6 m e ajustar livremente.
- [ ] Alternar contorno simples, sem borda e meio-fio duplo; acabamento liso/placas. Faixa central de rua é opcional.
- [ ] Conferir cruzamento, encontro em T, pontas encostadas, curvas e larguras diferentes; junção deve ficar livre de linhas internas. Sobreposição indica mesmo nível.
- [ ] Selecionar e mover cada traçado, editar/inserir/remover vértices e desfazer/refazer.
- [ ] Salvar/reabrir e colocar módulo contendo vários traçados; conferir estilo e junções preservados.
- [ ] Exportar PNG/SVG com Equipamentos habilitado e conferir temas verde, azul e impressão. Equipamentos devem permanecer acima das vias.

229 testes aprovados. Composição SVG renderizada e inspecionada; interação no navegador pendente. Sem build/publicação. Retirada das extensões de piso dos corredores registrada para o próximo ajuste.

### Piso nas pontas dos corredores — corrigido

Removido o prolongamento de meia largura além dos pontos inicial e final. Piso e acabamento agora terminam nas coordenadas reais do corredor, aberto ou fechado, inclusive em diagonais. Mantido apenas o pequeno recobrimento lateral de antialiasing; portas/janelas continuam com o preenchimento específico de suas aberturas. Corrige também mapas existentes ao abrir, sem migração de coordenadas.

- [ ] Conferir corredor aberto nas duas pontas, em horizontal, vertical e diagonal: nenhum bloco de piso deve ultrapassar o final das paredes.
- [ ] Fechar/reabrir início e fim; conferir portas e janelas nessas extremidades.
- [ ] Conferir corredor conectado a sala e acabamento em placas, inclusive exportação PNG/SVG.

230 testes aprovados e renderização de corredor aberto/fechado com porta e janela inspecionada. Sem build/publicação; interação no navegador pendente.

### Módulos, exemplo e placas — 27/10/2026

- [ ] Inserir os oito módulos: Ponte, Enfermaria, Alojamento, Depósito, Engenharia, Refeitório, Laboratório e Segurança. Conferir escala, entradas livres e aparelhos sobre bancadas.
- [ ] Mover/duplicar conjunto, editar peças, salvar/reabrir e guardar um módulo pessoal. Bibliotecas antigas não devem mudar automaticamente.
- [ ] Salvar sua planta antes de Abrir exemplo; conferir os oito setores da Estação de pesquisa, corredores, portas, duto e textos. Conferir exportação.
- [ ] Caminho/calçada com placas: testar diagonal, curva e mudança de direção. Juntas devem acompanhar o traçado, sem grade global; cruzamentos não devem acumular detalhes.
- [ ] Rua deve permanecer lisa, com faixa central opcional.

233 testes aprovados, módulos/exemplo e circulação renderizados e inspecionados. Interação no navegador pendente. Sem build/publicação.

### Relevo — suspenso por decisão do usuário (27/10/2026)

Ribanceiras e penhascos foram retirados da implementação. Não incluir esta etapa na conferência atual; retomar apenas após redefinir o design. A ferramenta anterior Borda de desnível permanece.

## Revisão do catálogo — 27/10/2026

- [ ] Conferir os 19 desenhos revisados e os 26 novos assets listados em [revisao-assets-2026-10-27.md](revisao-assets-2026-10-27.md).
- [ ] Conferir sobreposição opaca, escala e rotação dos novos objetos.
- [ ] Abrir mapa antigo com ícones substituídos e verificar posição/tamanho.
- [ ] Testar famílias recolhidas e busca.
- [ ] Desenhar faixas de segurança/circulação curvas, salvar/reabrir e exportar.
- [ ] Aprovar visual de pias, balcões, palco, penteadeiras, barraca, quiosque e equipamentos industriais.

235 testes aprovados e pranchas inspecionadas tecnicamente; aprovação estética e interação final pendentes. Sem build/publicação.

## Ajustes de inserção e sinalização — 27/10/2026

- [ ] Comparar espessuras de paredes avulsas e de salas, nos quatro tipos, incluindo portas e encontros.
- [ ] Faixa de segurança com contornos e hachuras como o asset; circulação com duas bordas e eixo tracejado. Escolher verde/âmbar e salvar/reabrir.
- [ ] Conferir prévia do módulo pronto e do texto antes de clicar.
- [ ] Girar equipamento antes de inserir: R/Shift+R na viewport ou ângulo na lateral; comparar prévia e peça inserida.
- [ ] Reabrir exemplo novo: textos das saídas de ventilação próximos aos acessos, dentro das salas. Mapas já salvos não são reposicionados.

## Interface — organização inicial

- [ ] Criar à esquerda e editar a seleção à direita, sem perder a ferramenta ativa.
- [ ] Abrir configurações, recuperação e exportação pelo topo; verificar acesso ao final do painel.
- [ ] Inserir módulo pessoal pela biblioteca à esquerda.
- [ ] Expandir família e categoria de assets: conferir recuo e distinção visual.
- [ ] Conferir painéis e rolagem em janela estreita e modo de foco.

## Seletores visuais

- [ ] Escolher porta/janela, paredes e acabamentos pelas miniaturas; conferir opção ativa.
- [ ] Selecionar cada traçado e conferir largura, bordas e demais controles específicos.
- [ ] Alternar piso na criação e na seleção sem alterar o outro contexto.
- [ ] Usar Tab e Enter/Espaço nos botões; conferir dicas e nomes completos.
- [ ] Verificar legibilidade e rolagem nas laterais estreitas.

### Legibilidade das amostras ampliadas

- [ ] Distinguir porta e janela sem zoom: abertura ocupa a amostra, com batentes e vidro ampliados.
- [ ] Conferir paredes com traços ampliados, percursos em trechos curtos e pisos com padrões maiores.
- [ ] Verificar os botões na largura normal da lateral. São amostras de identificação; as dimensões dos objetos no mapa permanecem iguais.

Correção de legibilidade: regra genérica de ícones de 20 px exclui os botões de amostras, inclusive seus SVGs internos. Conferir largura ocupada na lateral real; caminho, calçada, rua e canaleta gradeada agora têm amostras distintas. Navegador automatizado não iniciou neste ambiente; conferência interativa pendente.

## Áreas: forma e finalidade

- [ ] Criar sala, piso, piscina e lago como retângulo, elipse e por vértices. Água/piso não devem gerar paredes.
- [ ] Conferir prévia, desfazer/refazer, edição por vértices e salvar/reabrir. Elipses de piso/água são contornos de pontos.
- [ ] Após escolher piscina, inserir módulo: suas salas devem continuar salas.
- [ ] Verificar troca de forma, atalhos e tipo de parede das salas.

Acabamentos contextuais: piscina/lago mostram somente ajustes de água, sempre visíveis. Pisos mostram estilos sem expansão e sem Técnico. Mapas antigos com painéis técnicos continuam sendo lidos.

## Família Percursos

- [ ] Selecionar corredor, ventilação, rio, trilhos e sinalização; conferir largura inicial e controles específicos.
- [ ] Corredor deve criar paredes; ventilação deve manter acessos; demais traçados não devem criar paredes.
- [ ] Concluir, voltar ponto e cancelar aparecem durante o desenho; Enter e Escape continuam funcionando.
- [ ] Salvar/reabrir, selecionar e editar percursos; conferir que o tipo permanece correto.
- [ ] Trocar de família e voltar; verificar destaque do botão e seleção visual.

## Compactação dos controles e cabeçalho

- [ ] Medidas da seleção em duas colunas: editar X/Y, largura/altura e rotação.
- [ ] Sobreposição sempre visível: Frente, +1 nível, −1 nível, Fundo.
- [ ] Cotas direta/horizontal/vertical e módulos prontos selecionáveis por botões.
- [ ] Traçados: bordas, acabamento e cor por botões; explicação em Como desenhar.
- [ ] Checkbox e rótulo na mesma linha, inclusive união de paredes.
- [ ] Cabeçalho compacto com nome do projeto; configurações continuam acessíveis.
- [ ] Foco oculta apenas a confirmação repetitiva de alteração local; erros e orientações permanecem.

### Modos de projeto — base de Colônia
- Em Projeto e escala, alternar Construção/Colônia e verificar mudança das ferramentas e catálogo.
- Em Colônia, testar área retangular/polígono, água, percurso externo e vegetação.
- Salvar e reabrir: conferir modo mantido e medidas inalteradas.
- Abrir mapa antigo e alternar modos: conferir preservação de objetos e pavimentos; voltar a Construção para ferramentas internas.
- Talude, penhasco e novos prédios ainda não fazem parte desta etapa.

### Talude / penhasco (modo Colônia)
- Percursos → Talude ou Penhasco: desenhar reto e com curvas, concluir com Enter.
- Alternar Lado baixo Direita/Esquerda; conferir marcas acompanhando o contorno.
- Alterar largura e vértices, desfazer/refazer, salvar/reabrir e exportar Equipamentos.
- Conferir legibilidade na escala do mapa. A largura é visual, ainda não representa cota/altura física.

### Primeiras edificações externas
- Projeto e escala → Colônia → Equipamentos → Colônias → Edificações e infraestrutura.
- Conferir as 8 peças: habitação, hangar, usina, estufas, plataforma de pouso, mercado, silos e posto de controle.
- Posicionar sobre caminhos e outros objetos para confirmar coberturas opacas; espaços entre estruturas permanecem vazios.
- Rotacionar, redimensionar, salvar/reabrir e exportar; conferir proporções e legibilidade no mapa.

### Revisão das coberturas externas
- Conferir distinção entre claraboias, painéis solares e exaustores no bloco habitacional.
- Usina: tanques com bocais, tubulações e unidades de ventilação.
- Estufas: caixilhos e vidro; posto de controle: antena com prato e suporte, diferente dos exaustores.
- Hangar, mercado e silos: conferir espessuras e detalhes em zoom normal. Plataforma de pouso preservada.

### Expansão colonial — 16 novos assets
- Conferir os quatro subgrupos em Equipamentos → Colônias e busca por nome.
- Contenção de reator, laboratório, administração, posto médico/hospital, segurança, residências compacta/alta densidade.
- Armazéns comum/refrigerado, processador atmosférico, hidroponia, tratamento de água, subestação, garagem e comunicações.
- Validar escala em conjunto, rotação/prévia, sobreposição opaca, salvar/reabrir e exportação. Processador atmosférico tem 70 × 48 m: aumentar o mapa se necessário.

### Conferência — infraestrutura e edição numérica
- Trocar larguras apagando todo o valor e digitando outro; Enter/apagar foco aplica, Escape cancela. Conferir projeto, seleção, rotação e coordenadas.
- Colônia: definir largura 1500 m e depois até 10000 m; salvar/reabrir, navegar e ampliar.
- Mover edifício parcialmente para fora de cada borda; exportar PNG/SVG e conferir recorte e preservação no projeto.
- Confirmar pás verdes/azuis conforme tema na exportação; espessuras anteriores preservadas.
- Selecionar rua e definir Calçadas automáticas = 2 m; cruzar ruas com calçadas, editar vértices/curvas e conferir quinas. Calçadas antigas independentes devem ser removidas manualmente se estiverem duplicando a faixa automática.
- Conferir Tubulação, Fiação, Eletrocalha; poste, transformador e tampas em Área externa nos dois modos.
