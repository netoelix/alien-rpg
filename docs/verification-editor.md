# Verificação do editor local

História verificada: formulário React → API local → validação → backup e gravação do acervo → leitura da campanha no site.

| Limite do fluxo | Resultado | Evidência |
| --- | --- | --- |
| Formulário | Confirmado | Campanha e jogador temporários cadastrados pelo navegador. |
| Cliente → API | Confirmado | Salvar respondeu com mensagem e nome de backup. |
| API → arquivo | Confirmado | archive.json apresentou duas campanhas, com um jogador na campanha temporária. |
| Backup | Confirmado | Arquivo anterior preservado; teste automatizado compara conteúdo exato. |
| Leitura | Confirmado | Campanha apareceu no seletor com links próprios e nenhum log herdado. |
| Proteção | Confirmado | Testes recusam IP externo, Host ou Origin diferente, dados inválidos e revisão antiga. |
| Build público | Confirmado | Bundle sem endereço da API e sem botão de gravação; nenhuma entrada do editor na navegação pública. |

Foram executados 11 testes, formatação, build e verificação de navegação. No Windows, o teste de substituição atômica foi executado fora da restrição do diretório temporário do sandbox. O acervo de teste foi restaurado com backup e somente Fragmentos da Guerra permanece no arquivo entregue.

O teste revelou que a atualização automática do servidor removia a mensagem de gravação. O plugin passou a suprimir essa atualização para o acervo; a mensagem agora permanece visível e a prévia é recarregada separadamente.

Limites: sem publicação automática, escrita remota, upload de imagens ou identidade global dos jogadores. Backup exige espaço e permissões locais; falha na cópia impede a gravação. Os links de missões e jogadores ainda dependem da ordem dos registros no acervo importado.

Atualização de campos: 15 testes passaram. No navegador, um nome de campanha vazio foi aplicado e convertido em Campanha 2; personagens incompletos exibiram nome, profissão, biografia, jogador e retrato como erros explícitos. A situação opcional dos personagens existentes permaneceu não informada. Nenhuma edição de teste foi gravada no acervo.


## Catálogo geral e prévia do rascunho

As 113 definições de conquistas são universais. O formato 2 guarda o catálogo em `archive.achievements`; cada campanha mantém apenas os identificadores e suas concessões. Arquivos e rascunhos do formato 1 são convertidos ao carregar, preservando todos os dados. O arquivo original só é convertido na próxima gravação com backup, evitando invalidar rascunhos já abertos.

Conferir site cria uma cópia independente do rascunho aplicado no armazenamento local do navegador. A aba de prévia exibe um aviso e permite navegar entre campanhas, missões, jogadores e personagens dessa cópia. Não grava arquivos nem publica. As cinco prévias mais recentes são mantidas; links antigos podem precisar ser abertos novamente pelo editor. A versão pública ignora esse mecanismo.

Validação: 17 testes; catálogo universal com concessões antigas preservadas; nova campanha sem concessões herdadas; prévia independente com jogador e missão; backup atômico e conflitos. No navegador, uma campanha e missão novas abriram sem gravação, e o seletor de conquistas da nova campanha apresentou as 113 definições.


## Registros por sessão e cadastro único de jogadores

Uma missão continua sendo uma pasta. Seu relato original permanece como primeiro registro; novos registros ficam em `mission.logs`, com título livre, referência de sessão opcional, data fictícia, equipe e texto próprios. O editor oferece REGISTROS DE SESSÃO para criar e editar esses registros. Links antigos `log/0` continuam abrindo o relato original; novos links `log/0/1` abrem registros adicionais. A data própria do primeiro registro usa `logDateTime`, preservando a data da missão. A associação a personagens considera as equipes e relatos de todos os registros da pasta.

Jogadores passam a ter um cadastro pessoal em `playerProfiles`, ligado explicitamente às participações de cada campanha. Ao criar um jogador, escolha uma pessoa existente ou crie uma nova. Nomes iguais não unem pessoas. Personagens continuam pertencendo à campanha. Renomear um cadastro atualiza seus vínculos e concessões nas campanhas; a página pessoal mostra as campanhas e o acervo de conquistas com sua origem. Uma conquista universal já recebida não pode ser concedida novamente em outra campanha. Estrelas por repetição permanecem para uma etapa posterior.

O acervo original não foi reescrito. Dados antigos recebem adaptação em memória e só mudam de formato no próximo salvamento com backup. Validação: registros originais preservados, registros adicionais vinculados a personagens, rejeição de registros incompletos ou repetidos, reutilização de pessoas, homônimos independentes, renomeação com datas preservadas, prevenção de concessões duplicadas e salvamento com backup de registros por sessão. No navegador: uma missão de teste exibiu dois registros, a sessão 2 abriu seu título e texto próprios, e o jogador existente manteve seus personagens e conquistas de Fragmentos da Guerra no perfil entre campanhas.


Os cards de campanhas do perfil levam à rota `player-characters`, que exibe somente os personagens daquele jogador na campanha escolhida. Verificado no navegador: André na campanha de teste abriu o card de Fragmentos da Guerra e visualizou exclusivamente Trisha e Takeo, com links para seus dossiês.


## Separação completa entre missão e registros

O cadastro de missão contém nome, sistema, data fictícia e equipe; pode existir sem relatos. Todos os textos são cadastrados e editados em REGISTROS DE SESSÃO. Os 17 relatos de Fragmentos da Guerra foram transferidos para `mission.logs` após gerar um backup integral. Impressões SHA-256 verificam texto, equipe, data, sistema e ordem originais. A normalização converte backups e rascunhos antigos de forma idempotente, incluindo registros adicionais já criados. O manifesto de migração permite recuperar o rascunho aplicado à revisão anterior somente enquanto o arquivo ainda corresponde exatamente à revisão migrada; a proteção contra conflitos continua ativa. Links antigos continuam abrindo o primeiro registro.

Conquistas, acervo entre campanhas e missões do perfil do jogador começam recolhidos. O botão EXPANDIR abre o conteúdo e passa a RECOLHER, mantendo contagens visíveis. As missões na guia de personagem usam o mesmo controle. Verificação no navegador: 40 conquistas e 17 missões expandiram e recolheram; missão criada sem texto e relato migrado disponível na seção de registros.
