# Avaliação de desempenho — 25/10/2026

## Escopo e limites
Análise do código local e microbenchmark de geometria em Node v24.16.0. Não é medição de FPS nem perfil de GPU do navegador. O arquivo real do usuário não foi analisado. Nenhuma alteração funcional nesta avaliação.

## Medições exploratórias
Cada cenário contém salas retangulares, uma porta e cinco equipamentos por sala. Tempos de uma execução; há influência de aquecimento/JIT. O objetivo é localizar gargalos, não estabelecer limites suportados.

| Salas | Objetos totais | Uma passagem de geometria das portas | Encaixe médio por consulta (20 consultas) |
|---|---:|---:|---:|
| 20 | 140 | 24,39 ms | 0,27 ms |
| 50 | 350 | 267,11 ms | 0,34 ms |
| 100 | 700 | 2212,85 ms | 0,54 ms |

## Achados
- openingGeometry chama sharedOpeningAnchor; este reconstrói estruturas e resolve sobreposições para cada abertura. Drawing chama openingGeometry repetidamente por abertura em máscaras, acabamento do piso e desenho.
- Eventos de movimento atualizam cursor/guias/view no componente editor. Drawing não é memoizado; o movimento da câmera pode recalcular geometria sem alteração dos objetos.
- sharedWallStructures compara pares de trechos; sharedWallJunctions e partitionEndCaps também crescem com a quantidade de paredes. Portas multiplicam esse trabalho.
- O encaixe recompõe e ordena os pontos de referência a cada consulta. No cenário medido foi secundário, mas pode ser armazenado enquanto o projeto não mudar.
- Existem máscaras SVG por estrutura. O custo de composição/rasterização ainda precisa ser medido no navegador.

## Local versus produção
O desenvolvimento usa React.StrictMode, que pode repetir renderizações para diagnóstico. Isso pode amplificar o problema. A produção publicada no PR #64 também não contém o mesmo catálogo e encaixe do código local atual; a comparação anterior não isola o modo de execução.
Para comparação válida, usar o mesmo projeto de mapa na build local de produção e no modo dev, com navegador, zoom e tamanho da janela equivalentes.

## Ordem recomendada de correção
1. Resolver paredes uma vez por versão da geometria e calcular cada abertura uma vez, reutilizando o resultado.
2. Separar desenho estático de cursor, seleção e guias; navegação não deve refazer paredes.
3. Reutilizar índice de encaixe e agrupar eventos de ponteiro por quadro.
4. Medir renderização SVG em mapas reais; só então avaliar simplificação de máscaras ou renderização por área visível.

## Validação posterior
Comparar pan/zoom sem seleção, movimento de objeto, edição de parede e posicionamento de porta; medir p50/p95 e quadros longos, verificando também exportação e acabamento das paredes.

## Mapa real Teste.alien-map

Analisado diretamente de Downloads, sem modificar o original. 137 objetos: 9 salas retangulares, 11 corredores, 37 aberturas, 78 equipamentos, 1 divisória e 1 sala oval.

Cinco amostras após aquecimento: medianas de 2,29 ms para paredes compartilhadas, 1,85 ms para junções, 16,02 ms para acabamentos das divisórias, 60,58 ms para uma passagem de geometria das aberturas e 0,38 ms para uma consulta de encaixe.

Geração do Drawing completo com React renderToString (sem DOM/GPU, sem medir FPS): 992,62 / 988,80 / 986,28 ms no runtime de desenvolvimento; 955,62 / 1069,64 / 998,57 ms com NODE_ENV=production. O resultado tem 124.325 bytes, 276 paths e 47 máscaras. Isso não é um teste do deploy Vercel nem substitui um perfil no navegador. A semelhança dos tempos indica que o cálculo de geometria domina esse ensaio independentemente das verificações de desenvolvimento.

Conclusão: neste mapa real, a prioridade é eliminar o recálculo global por abertura e isolar pan/zoom da geometria, antes de reduzir qualidade ou quantidade dos assets.

## Primeiro bloco de otimizações

Drawing agora resolve paredes compartilhadas uma vez e calcula a geometria de cada abertura uma vez por conjunto de elementos. Junções, trechos e acabamentos também são reutilizados enquanto os elementos não mudam. React.memo e uma prévia vazia estável permitem evitar a reconstrução do desenho durante pan e movimento simples do cursor. Zoom pode atualizar alças/grade, mas reutiliza a geometria.

Repetição do ensaio renderToString no mapa real: 87,63 / 87,73 / 85,40 ms, contra mediana anterior de 988,80 ms (redução aproximada de 91%). Saída manteve 124.325 bytes, 276 paths e 47 máscaras; isso é uma checagem estrutural, não comparação visual pixel a pixel. FPS e custo de composição SVG no navegador ainda precisam de conferência. Original em Downloads não foi alterado.
