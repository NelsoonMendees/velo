# 📌 Contexto
Hoje o pipeline de CD (.github/workflows/cd.yml) faz o seguinte fluxo:

Roda os testes unitários
Faz deploy de preview na Vercel
Executa os testes E2E (Playwright) contra a URL de preview
Promove o mesmo build para produção


A separação preview/produção na Vercel não resolve sozinha — o front-end da preview continua apontando para o Supabase de produção, porque as variáveis VITE_SUPABASE_* estão iguais nos dois ambientes.

# 🎯 Objetivo
Criar um segundo projeto Supabase que servirá como ambiente de preview. O ambiente atual permanece como produção. Ao final:

Deploys de preview devem usar o Supabase de preview
O promote para produção deve fazer com que a aplicação passe a usar o Supabase de produção
Os testes E2E devem rodar contra o banco de preview, sem encostar em produção

#🧩 Tarefas
- 🗄️ Provisionar o segundo projeto Supabase
Criar um novo projeto no supabase.com (ex: velo-sprint-preview)
Aplicar as migrações do diretório supabase/migrations no novo projeto
Fazer deploy das Edge Functions do diretório supabase/functions no novo projeto
Conferir que as policies de RLS estão idênticas ao projeto de produção
Dica: o CLI do Supabase (yarn supabase link + yarn supabase db push + yarn supabase functions deploy) já está documentado no README. O detalhe é cuidar para qual --project-ref você está apontando antes de cada comando.

- ⚙️ Configurar variáveis de ambiente na Vercel
A Vercel permite definir variáveis de ambiente por ambiente (Production, Preview, Development). Você precisa garantir que:

No ambiente Production da Vercel, as VITE_SUPABASE_* apontem para o projeto Supabase de produção (o atual)
No ambiente Preview da Vercel, as VITE_SUPABASE_* apontem para o novo projeto Supabase de preview
Variáveis envolvidas: VITE_SUPABASE_URL, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY.

- 🔄 Garantir que o pipeline use as variáveis certas
Olhe com atenção esta parte do workflow:

`
- name: Pull Vercel Config
  run: |
    yarn vercel pull --yes \
    --environment=preview \
    --token=$VERCEL_TOKEN \
    --scope=$VERCEL_SCOPE

- name: Build Vercel
  run: yarn vercel build --token=$VERCEL_TOKEN
`
Pergunta para refletir: o vercel pull --environment=preview baixa as variáveis de qual ambiente? E o build resultante carrega quais valores das VITE_SUPABASE_* no bundle?

Atenção: variáveis VITE_* são embutidas no bundle em tempo de build. Isso tem implicação direta no passo de promote. Investigue se o vercel promote apenas re-aponta o domínio para um build já existente, ou se gera um novo build.

1. 🚢 Validar o fluxo de promote
O job promote no workflow atual faz:

`
npx vercel@latest promote ${{ needs.build-and-deploy.outputs.deployment-url }} ...
`
Pense:

Se o build de preview foi gerado com as variáveis do Supabase de preview, ao promover esse mesmo build para produção, com qual banco a aplicação em produção vai conversar?
O comportamento desejado é que produção fale com o Supabase de produção. Como você resolve isso?
Existem mais de um caminho válido. Documente no PR a escolha que você fez e o porquê.

# ✅ Critérios de Aceitação
Existem dois projetos Supabase distintos, um para preview e outro para produção
Um pedido criado durante a execução dos testes E2E não aparece no banco de produção
Após o promote, a aplicação em produção lê e escreve no banco de produção (e não no de preview)
Os testes E2E continuam passando no pipeline
As migrações e Edge Functions estão sincronizadas entre os dois projetos
As secrets/variáveis sensíveis não foram commitadas no repositório

# 💡 Dicas e Armadilhas
Edge Functions: lembre-se que o segundo projeto começa vazio. Sem deploy das functions, chamadas do front vão dar 404.
supabase link: o CLI guarda o último projeto vinculado. Antes de rodar db push ou functions deploy, confirme com yarn supabase projects list qual está ativo.
RLS: se você criou o projeto novo "do zero", as policies precisam vir das migrações. Não recrie tabelas pela UI — confie nas migrações para manter os ambientes idênticos.
VITE_* no build: variáveis com prefixo VITE_ viram strings literais dentro do JavaScript final. Você não consegue trocá-las "em runtime" só renomeando domínios.
TestDino / Playwright report: como o job de E2E publica relatório, certifique-se de que ele aponta para a URL correta após sua mudança.