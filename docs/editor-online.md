# Editor online: configuração e operação

O site público continua estático. Somente o administrador usa Discord e Supabase; jogadores enviam textos pelo Google Forms, que o mestre copia para o editor. O formulário não publica automaticamente.

## Contas e acesso

1. Crie um projeto Supabase Free e guarde a senha do banco fora do código.
2. Em Discord Developer Portal, crie uma aplicação. Em OAuth2, registre `https://SEU-PROJETO.supabase.co/auth/v1/callback`.
3. No Supabase, Authentication → Sign In / Providers → Discord: habilite e cole Client ID e Client Secret diretamente nos campos. Não crie bot nem solicite acesso a servidores/mensagens. O provedor padrão pode coletar o e-mail do administrador; ele não é publicado.
4. Em Authentication → URL Configuration, use Site URL `https://diariodeumrpg.vercel.app` e autorize o redirect exato `https://diariodeumrpg.vercel.app/?admin=1`. Não use curingas para previews.
5. Execute `supabase/editor.sql` no SQL Editor do projeto novo. As tabelas usam RLS sem acesso para usuários públicos ou autenticados. Somente a API administrativa usa a chave secreta.
6. Na Vercel, no projeto `diario-alien-rpg`, Settings → Environment Variables, configure as variáveis de `.env.example` somente em Production. O ID do Discord deve ser o número permanente, não o nome. Não use prefixo VITE nas chaves privadas.

`SUPABASE_PUBLISHABLE_KEY` é a chave pública do projeto. `SUPABASE_SERVICE_ROLE_KEY` recebe a chave secreta de backend (`sb_secret_…` ou a chave legada `service_role`), como Secret/Sensitive na Vercel. Nunca envie chaves no chat, em capturas ou commits. O Client Secret do Discord fica somente no Supabase.

## Publicação no GitHub

Crie um token fine-grained do GitHub restrito a **netoelix/alien-rpg**, com Contents: Read and write (Metadata: Read é automático). Guarde-o diretamente em `EDITOR_GITHUB_TOKEN`, como Secret/Sensitive na Vercel. Use expiração e substitua o token quando necessário. Ele concede escrita no repositório; o servidor limita as operações a `data/archive.json`, retratos em `public/assets/` e `public/publication.json`. Não conceda Workflows, Administration ou acesso a todos os repositórios.

O botão Publicar cria um commit na branch configurada, acionando a integração Git da Vercel. Se regras da branch bloquearem o commit, a publicação falha; não desative proteções para contornar isso. O fluxo precisa então ser adaptado para pull requests.

O editor compara a revisão do banco e o SHA do conteúdo Git para recusar sobrescritas concorrentes. Edições de código podem continuar pelo GitHub, mas o conteúdo deve ter o editor online como origem principal após a migração. Alterações manuais concorrentes de `data/archive.json` exigem reconciliação antes de publicar novamente.

Salvar guarda o acervo privado e uma cópia anterior no histórico, dentro da mesma transação. Publicar envia todos os registros ativos: os campos de diário que o mestre inserir são considerados aprovados. Não há diário pendente dentro do acervo público. A lixeira, campos extras, credenciais e histórico não entram no snapshot.

Após o envio, use Conferir publicação. A confirmação consulta um marcador estático publicado no mesmo commit. Enviado ao GitHub não significa publicado: se a Vercel falhar, a versão anterior permanece e o marcador não muda. Recarregue o editor antes da próxima publicação.

## Google Forms sem login

Na conta Google do mestre, crie um formulário com jogador/apelido, campanha, personagem, título, data fictícia, texto longo e observações opcionais para o mestre. Não solicite e-mail, upload de arquivos ou limite de uma resposta por conta. Desative coleta de e-mail e qualquer restrição de domínio/login; não habilite resumo público das respostas. Contas Google Workspace podem impor restrições da organização.

Teste o link de resposta em uma janela anônima, sem sessão Google. O formulário deve permitir enviar sem login. Verifique também que respostas de outras pessoas não são visíveis. Configure o link de resposta em `VITE_JOURNAL_FORM_URL` (não o endereço de edição) e publique uma nova versão do código. O botão aparece na aba Diário dos personagens.

As respostas ficam no Google Forms. Revise autoria e conteúdo, copie apenas o texto aprovado para o editor, salve e publique. Qualquer pessoa com o link pode enviar: sem login, a identidade declarada não é comprovada. Confirme entradas suspeitas pelo Discord.

## Disponibilidade, privacidade e recuperação

- Se Supabase pausar, leitura pública e imagens publicadas continuam na Vercel. Login, edição e novos uploads aguardam reativação.
- Retratos novos ficam privados no banco até publicação; somente os associados ao acervo ativo são copiados ao Git. Não há publicação automática de todos os uploads.
- O histórico privado fica no mesmo banco e não substitui um backup externo. Exporte JSON pelo editor; os retratos não estão incluídos no JSON. Preserve também o repositório publicado e exporte a tabela `editor_assets` para recuperar retratos ainda inéditos. O Free não inclui backups automáticos do provedor.
- O histórico cresce a cada gravação. Monitore armazenamento no painel do Supabase; antes de qualquer limpeza, exporte as cópias necessárias. A interface lista as 30 versões mais recentes, sem apagar as anteriores.
- A prévia online abre na mesma aba, usa armazenamento do navegador e exige autenticação. Sair apaga os rascunhos locais desse navegador. Não use computador compartilhado sem encerrar a sessão.
- `npm run editor` continua disponível como modo local. Não faça gravações concorrentes do acervo pelos dois modos após a migração.

## Validação antes de ativar

Execute testes e build; depois confirme em produção: conta autorizada entra, outra conta recebe acesso negado, chamadas anônimas não leem o banco, salvar/reabrir preserva rascunho, retrato novo aparece na prévia, histórico pode ser exportado, publicação cria um commit e o marcador aparece no site. Valide também a leitura sem consultar Supabase. A configuração só está concluída após esse teste real de ponta a ponta.
