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
