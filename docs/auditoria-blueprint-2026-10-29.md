# Auditoria técnica — Blueprint

Data: 29/10/2026. Escopo principal: código local do criador de mapas. Leitura complementar da estrutura do site/editor de campanhas; não é auditoria de segurança do backend, infraestrutura ou produção. Nenhuma funcionalidade foi alterada nesta auditoria. O checkout contém alterações anteriores não publicadas; as conclusões se referem a ele, não necessariamente à versão do Vercel.

## Diagnóstico

Há oportunidade real de reduzir duplicação e acoplamento sem reescrever o editor. O ganho principal esperado é consistência de comportamento e manutenção; ganho de velocidade ainda precisa ser medido. Não há benchmark de FPS ou perfil de memória nesta avaliação.

Levantamento local: 104 arquivos JS/JSX em src/blueprints, 20.669 linhas (inclui dados SVG). BlueprintEditor.jsx: 3.369 linhas e 58 chamadas useState. model.js: 1.243 linhas. Drawing.jsx: 702 linhas. colony-assets.js: 4.109 linhas de catálogo, que não devem ser confundidas com complexidade de lógica.

## Achados e prioridade

### A1 — Coordenador do editor concentra responsabilidades (alta)

Evidência: BlueprintEditor.jsx reúne seleção, ferramenta, gestos, câmera, desenhos temporários, transformação, abertura de arquivo, exportação, recuperação, histórico, formulários e commit. commit, próximo à linha 271, também resolve portas, segue paredes, elimina vínculos inválidos e normaliza o projeto.

Recomendação: extrair operações de projeto para funções puras; depois separar estado de documento/histórico, sessão de desenho e painéis. Evitar simplesmente mover 58 estados para um hook gigante. Manter estado transitório de mouse separado do documento persistido. Critério: um gesto concluído continua sendo uma ação de desfazer, sem alterar atalhos ou ordem de aplicação das regras.

### A2 — Normalização repetida do documento (alta)

Evidência: commit serializa e chama parseProject; groups.js, clipboard.js e várias operações de model.js também fazem parseProject(JSON.stringify(...)) antes de chegar ao commit. parseProject recursa pelos pavimentos inativos, serializando-os novamente (model.js, próximo à linha 1080).

Recomendação: separar parseProject(text), normalizeProject(raw) e validações de operações. Criar uma fronteira de transação que aplique invariantes uma vez. NÃO remover validação de importação nem assumir que todas as operações passam pela interface. Preservar erros e formatos antigos. Medir tempo de commit, normalização e alocações antes/depois com um e vários pavimentos.

### A3 — Dependências circulares na camada de domínio (alta)

Ciclos diretos identificados por imports locais: connections.js ↔ vent-links.js; connections.js ↔ model.js; model.js ↔ vent-links.js; model.js ↔ selection.js. O fato de o runtime funcionar não elimina a fragilidade de inicialização e a dificuldade de testar módulos isolados.

Recomendação: extrair IDs/constants e acesso a pavimentos para módulos sem dependências de regras de negócio. Separar validação/persistência de operações geométricas. Não introduzir um arquivo agregador que recrie os mesmos ciclos. Critério: módulos básicos podem ser importados independentemente, testes atuais continuam passando.

### A4 — Projeção e tolerâncias repetidas (média, bom primeiro bloco)

Evidência: cálculo de projeção ponto/segmento em model.js:366+, vent-ports.js:6+ e ventilation.js:14+. Vetores usam ora pares [x,y], ora objetos {x,y}. Existem tolerâncias com significados diferentes: conexão de ponta 0,15 m; acesso vertical coincidente 0,001 m; fechamento de ciclo 0,00001 m; encaixe geral em pixels convertido pela câmera.

Recomendação: helper puro projectPointToSegment, resultado com ponto/t/distância e tratamento explícito de segmento nulo; adaptadores nas bordas. Dar nomes às tolerâncias por finalidade. NÃO trocar todas por um epsilon global: precisão matemática, proximidade de interação e encaixe físico são conceitos diferentes.

### A5 — Traçados compartilham geometria, mas não semântica (média)

Base já existente: trace-geometry.js é reutilizada em traçados e referência de ventilação; vent-cycle.js concentra o fechamento. Ruas/calçadas/caminhos usam circulation.js e CirculationNetwork; ventilação usa ventNetworks e acessos; corredores dependem de paredes/aberturas.

Recomendação: núcleo de polilinha (pontos, segmento, ciclo, edição) e capacidades por família. Ex.: supportsCycle, junctionPolicy, endpointPolicy, render/export strategy. Começar por geometria pura, sem criar sistema de plugins extensível demais.

Preservar diferenças: cruzamento de ruas pode unir visualmente; cruzamento de dutos não conecta por si só; acesso manual pode impedir união; corredor deve respeitar paredes explícitas; calçada automática é derivada da rua, não objeto independente. Não prometer compatibilidade automática de todas as features após a extração.

### A6 — Vínculos de pavimento têm regras paralelas e limite no contrato (alta antes de reordenar pavimentos)

connections.js usa endpoints floorId/elementId; vent-links.js acrescenta portId. Ambos validam, removem vínculos inválidos e consultam pavimentos. floorElements conhece a representação especial: o andar ativo está em project.elements, demais em floors[].elements.

Risco concreto em connectVentFloor: escreve o destino apenas em floors[].elements. O fluxo atual da UI usa origem ativa e destino inativo; a função não explicita essa pré-condição. Reutilizá-la futuramente com destino ativo não atualizaria project.elements. Não foi observado erro no caminho atual da interface.

Recomendação: API única readFloor/updateFloor e contrato explícito para operações; separar validação espacial, integridade do vínculo e rótulos. Testar origem/destino ativos e inativos, cópia, remoção, limites, vínculo legado e desfazer. Isso deve preceder subsolos/reordenação e sincronização de movimento.

### A7 — Helpers e registro de assets (média/baixa)

R/C/P repetidos em hospitality-assets.js, mining-assets.js e revised-assets.js; convenções de escala e espessura semelhantes, mas não totalmente iguais. Catálogo depende de colonyAssets, vehicleAssets, furniture, categorias, grupos e legacyAssets.

Recomendação: pequeno conjunto de primitivas SVG em metros, estilo explícito por família e verificação única de registro/IDs/categoria/renderer. Manter identificadores e dimensões salvos, inclusive aliases antigos. Dados vetoriais extensos não são, por si, problema de desempenho; não reduzir detalhe visual em nome de número de linhas.

### A8 — Interface compartilhada: consolidar contratos (média)

Pontos positivos: NumberField, HelpHint, EditorPopup, OptionButtons e VisualChoices já oferecem bases reutilizáveis. Os painéis ainda têm distribuição manual de ajuda e estado específico dentro do editor.

Recomendação: campos/grupos com rótulo, ajuda contextual e mensagem de erro consistentes, sem um construtor genérico de formulários prematuro. Priorizar testes reais de teclado, clique/toque, Escape, fechamento de modal e retorno de foco. SSR/compilação não valida interação. No fluxo Posicionar conexão, conferir retorno de foco após fechamento do dialog: foco solicitado ao SVG no handler pode competir com o retorno nativo ao botão de abertura.

### A9 — Desempenho: preservar o que já melhorou, medir antes de mudar (média)

Drawing já usa memo e useMemo; CirculationNetwork memoiza geometrias/calçadas. O commit normaliza e recria objetos, podendo invalidar referências. ventNetworks procura correspondências entre trechos; multiplicar esse custo por movimentos de câmera seria indesejável, mas não foi medido nesta auditoria.

Protocolo: cenas sintéticas com 100/500/1500 objetos, um/vários pavimentos, muitos dutos e paredes; comparar desenvolvimento e build de produção. Medir pan/zoom, arrastar, commit, undo, salvar e exportar. Registrar hardware/browser e percentis, não apenas média. Introduzir índice espacial/cache somente com gargalo demonstrado; chavear por geometria/documento, não câmera.

### A10 — Cobertura não uniforme (alta como proteção da refatoração)

Testes de geometria, salvamento, módulos e conexões já fornecem boa base. tests/blueprint-catalog-review.test.js percorre revisedAssets/expandedAssets, apesar do nome amplo; não cobre sozinho todo o catálogo. Hospitality tem teste específico. As verificações recentes de mineração foram scripts avulsos, não garantia permanente da suíte.

Recomendação: matriz de contratos para todos os assets/traçados a partir do registro, fixtures pequenos de mapas antigos e testes de comportamento para transações. Manter revisão visual porque salvar corretamente não prova que uma cadeira está orientada corretamente. Usar cenas sintéticas para benchmarks/testes, sem incluir mapas privados do usuário no repositório.

## O que manter

- Renderização SVG compartilhada com exportação e recorte de camadas.
- Separação dos dados de assets e referências legadas.
- NumberField com digitação temporária separada da validação do projeto.
- Funções puras existentes de geometria, transformação e validação.
- IDs estáveis e formato retrocompatível. Não renumerar pavimentos ou converter mapas durante limpeza técnica.
- Distinção entre estado do documento e overlays/previews somente do editor.

## Sequência proposta

1. Estabelecer baseline de testes e fixtures; registrar pendências de interação e orçamento de desempenho.
2. Extrair primitivas geométricas e acesso seguro a pavimentos; manter assinaturas públicas com adaptadores. Risco baixo/médio.
3. Romper ciclos de imports, separar normalização de parsing; comparar saída serializada. Risco médio.
4. Centralizar transações e histórico; eliminar dupla validação comprovada. Risco alto: bloco isolado com regressões de desfazer/refazer e vínculos.
5. Dividir BlueprintEditor por responsabilidades, sem redesenhar a UI simultaneamente. Risco médio.
6. Consolidar núcleo de percursos e capacidades por ferramenta; então retomar ciclos/conexões para outras famílias. Risco alto se misturado com mudanças visuais.
7. Padronizar primitivas/registro de assets e consolidar testes de catálogo. Risco baixo/médio; preservar desenho.

Cada bloco: testes direcionados, comparação de persistência, revisão visual relevante e medição apenas quando houver hipótese de desempenho. Sem novas features, publicação ou refatoração ampla junto do mesmo bloco.

## Limitações

Análise estática com execução de testes; não inclui profiling interativo, revisão exaustiva linha a linha de todos os módulos ou auditoria de autenticação. O editor de campanhas (src/editor/Editor.jsx) também concentra formulário e coordenação, mas deve ser avaliado separadamente: domínio e persistência distintos, sem forçar unificação com Blueprint.

## Baseline executado

Comando: node --test --test-concurrency=1, TEMP/TMP apontando para .test-tmp/audit-temp devido às restrições do ambiente. Resultado: 254 testes, 254 aprovados, zero falhas/cancelados/ignorados, cerca de 62 segundos. Log local: .test-tmp/audit-tests.log. Isso mede execução da suíte, não desempenho da viewport. Não foi gerada build nem houve publicação nesta auditoria.
