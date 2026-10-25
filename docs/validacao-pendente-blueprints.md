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
