# Fichas de consulta dos sistemas

O catálogo cartográfico mantém os 278 IDs, nomes, posições e rótulos anteriores. As fichas de locais da referência ficam em data/official-system-profiles.json. A seleção inicial contém 43 fichas em 41 sistemas. Os 25 registros sem associação segura e os campos contraditórios constam em data/system-profile-import-review.json; não foram posicionados no mapa.

Cada ficha representa um local, ou conjunto de locais quando a fonte não permite separar. Nome/designação é obrigatório ao adicionar uma ficha. Nome comum, tipo, população, instalações, afiliação, atmosfera/clima, temperatura, terreno e recursos são textos opcionais. Não há cálculo de população total, inferência de planeta inexistente ou atualização automática de fronteiras. Não há campo de narrativa histórica.

## Editor

Em Navegação → Sistemas da campanha, selecione um sistema existente ou cadastre um novo. Em Planetas, luas e instalações, use Adicionar local. Aplique o sistema, salve o rascunho e publique. Sistemas anteriores sem fichas continuam válidos, incluindo NN39456 / PROSPECT.

Em Navegação → Fichas dos sistemas oficiais, selecione um dos sistemas do catálogo. As fichas salvas aqui são compartilhadas por todas as campanhas. A edição preserva nomes, coordenadas e instalações da referência cartográfica. Cada conjunto salvo substitui integralmente as fichas daquele sistema; uma lista vazia oculta as fichas de referência. Para variações de história e território use os controles da campanha, não estas fichas globais.

No mapa, selecione um sistema e expanda um local. Campos vazios ficam ocultos; zero continua sendo um valor válido. Busca inclui nomes comuns e instalações das fichas.

## Persistência

Fichas próprias: campaign.navigation.systems[].locations. Ajustes globais: archive.systemProfiles[systemId]. Os ajustes usam o mesmo rascunho privado, histórico e publicação explícita do acervo. A lista pública permite somente os campos conhecidos; observações privadas adicionais não são publicadas. Nenhuma migração SQL ou alteração do acervo existente é necessária.

Os testes de migração usam uma cópia estável do acervo v1, separada dos dados que o administrador publica. Isso impede que novas campanhas quebrem testes que verificam o formato histórico.
