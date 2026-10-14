# Mapa de campanhas — versão 3

O mapa-base contém 278 pontos catalogados da imagem *Stars of the Middle Heavens (2183)*, com nomes, instalações e coordenadas. Os sistemas oficiais são compartilhados e somente leitura. Sistemas descobertos, rotas e alterações territoriais pertencem à campanha.

## Consultar

Abra **Navegação**, arraste o mapa ou use as setas e o zoom. A busca inclui nomes e instalações. Selecionar um sistema centraliza sua posição. **Enquadrar percurso** mostra todas as paradas conhecidas, inclusive sistemas distantes como Sea Δ. **Centrar em Sol** restaura a vista inicial.

Sol está em (0, 0). X cresce para a direita e Y para cima. Cada quadrado mede um parsec, com décimos visíveis ao ampliar. Territórios e percurso podem ser ligados e desligados. O seletor **Percurso até** limita a rota sem apagar o histórico.

## Associar uma missão

Em **Editor local → Missões**, clique na busca ou em **Escolher sistema**. Role a lista ou escreva parte do nome de um sistema ou instalação. Clique no resultado para vincular a missão. O vínculo é salvo pelo identificador do sistema; o texto de localização continua editável para nomes de bases e operações.

**Cadastrar sistema nesta campanha** abre nome, coordenadas em parsecs e estações/postos (um por linha). Ao aplicar a missão, o sistema e o vínculo são criados juntos. Coordenadas precisam ser preenchidas; não se atribui posição zero automaticamente. Para posicionar visualmente ou por quadrado/subdivisão, use **Mapa estelar → Sistemas da campanha**.

Nomes antigos sem vínculo continuam sendo reconhecidos quando há uma única correspondência. A referência contém duas estrelas denominadas GL514, uma com Kellerat/LB-329 e outra com Feldspar. Elas têm IDs distintos e precisam ser selecionadas explicitamente. Sistemas de outras campanhas não aparecem na lista. Remover um sistema é impedido enquanto uma missão ou parada o referencia.

## Sistemas exclusivos

Em **Mapa estelar → Sistemas da campanha**, informe nome, instalações e posição. Você pode usar X/Y, o setor e sua subdivisão de 0 a 9, ou clicar com a ferramenta de posicionamento. Por exemplo: setor X = −1, coluna 5 e setor Y = 2, linha 3 correspondem a (−0,5; 2,3).

Os sistemas oficiais não são alterados pelo editor. Não existe transferência automática de descobertas entre campanhas.

## Territórios

O manto-base distingue Fronteira (geográfica), UPP, Império dos Três Mundos, Américas Unidas e Colônias Independentes. Os contornos foram refinados a partir das áreas coloridas da referência e incluem regiões descontínuas. São aproximações cartográficas.

Em **Territórios e regiões**, crie um círculo (centro em parsecs e raio em anos-luz) ou um polígono com pelo menos três vértices. Um ano-luz equivale a aproximadamente 0,307 parsec. **Personalizar nesta campanha** copia uma região e oculta seu original nessa campanha. Use **Área do contorno** para editar a área principal ou um enclave; é possível adicionar/remover áreas separadas. Todas as partes conservam a mesma cor e nome.

Os vértices podem ser ajustados numericamente ou acrescentados com a ferramenta de desenho. Para restaurar a base, remova a cópia local e reative a região original. Ainda não há cronologia de mudanças territoriais: a configuração vale para a campanha inteira.

## Percurso e Fragmentos da Guerra

Sem rota manual, as missões determinam a sequência. Em **Rota e paradas**, você pode definir uma sequência própria, com chegada, saída opcional, observação e missão associada. Datas são textos do universo, sem conversão para o calendário real. Retornos ao mesmo sistema são permitidos. Uma parada desconhecida interrompe a linha.

As 17 missões de Fragmentos da Guerra estão vinculadas:

- **QG Provisorio – AU:** ZKH-341. Seu rótulo e a data censurada foram preservados.
- **Sea Δ:** (0, −60) pc, aproximadamente conforme orientação do autor.
- **Acheron Prime:** (10,5; 6,2) pc, estimado da imagem enviada pelo autor; exclusivo de Fragmentos da Guerra, distinto de LV-426/Acheron.

Os relatos, participantes, datas e ordem originais foram preservados. Os dois sistemas fictícios não entram no catálogo universal.

## Referência, precisão e gravação

A imagem de 8,45 MB foi retirada de `public/assets` e da versão publicada. Uma cópia de trabalho está em `../map-catalog-work/galaxy-map-reference.jpg`, fora do projeto v3; o checkout original também conserva sua referência. O site usa os catálogos JSON e o canvas, sem carregar essa imagem.

As coordenadas são estimativas bidimensionais levantadas da imagem, não posições astronômicas 3D. Referências direcionais fora da área plotada não recebem coordenadas inventadas. As letras do aglomerado Crestus Prime foram qualificadas com o nome do aglomerado para serem pesquisáveis.

**Aplicar ao rascunho** e **Salvar arquivos com backup** são etapas distintas. A migração guarda a revisão anterior e recupera rascunhos compatíveis da mesma sessão, preservando alterações já feitas. O editor continua local; a publicação é somente leitura.
