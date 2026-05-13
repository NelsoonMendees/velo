# Solução do Desafio: Ambientes Supabase Separados (Preview × Produção)

## Diagnóstico do problema central

O `vercel promote` **não gera um novo build** — ele apenas redireciona o domínio de produção para o deployment já existente. Como variáveis `VITE_*` são embutidas como strings literais no bundle JavaScript em tempo de compilação, um build feito com as variáveis de preview vai continuar apontando para o Supabase de preview mesmo depois de promovido. Isso invalida a estratégia atual de promote.

---

## Etapa 1 — Provisionar o segundo projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto, ex: `velo-sprint-preview`.
2. Após criação, anote o **Project Ref**, **URL** e **anon/public key** do novo projeto.
3. No terminal local, aponte o CLI para o novo projeto e sincronize:

```bash
# Vincule ao projeto de preview
yarn supabase link --project-ref <PREVIEW_PROJECT_REF>

# Confirme qual projeto está ativo  
yarn supabase projects list

# Aplique todas as migrations
yarn supabase db push

# Faça deploy de todas as Edge Functions
yarn supabase functions deploy
```

> **Atenção:** nunca crie tabelas pela UI do novo projeto. Confie exclusivamente nas migrations para garantir paridade com produção.

4. Verifique as RLS policies via `supabase db diff --schema public` comparando os dois projetos.

---

## Etapa 2 — Configurar variáveis de ambiente na Vercel por ambiente

Na dashboard da Vercel (Settings → Environment Variables), configure cada variável **separadamente por ambiente**:

| Variável | Environment: Production | Environment: Preview |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase de produção | URL do projeto Supabase de preview |
| `VITE_SUPABASE_PROJECT_ID` | Project ID de produção | Project ID de preview |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key de produção | Anon key de preview |

Também adicione as secrets necessárias ao GitHub Actions:

```
SUPABASE_PREVIEW_PROJECT_REF   → project ref do Supabase de preview
SUPABASE_PREVIEW_DB_PASSWORD   → senha do banco de preview (para migrations no CI, se necessário)
```

---

## Etapa 3 — Solução para o pipeline (a mudança crítica)

### Por que o promote atual está errado

```
vercel pull --environment=preview   ← baixa vars de preview
vercel build                        ← bundle gerado com VITE_SUPABASE_* de preview
vercel deploy --target=preview      ← deploy na URL de preview ✓
vercel promote <preview-url>        ← só muda o apontamento do domínio, NÃO reconstrói
                                    ← produção fica com o bundle de preview ✗
```

### Solução escolhida: build dedicado para produção

Em vez de promover o build de preview, adicionar um job separado que faz um novo build usando as variáveis de **produção** e faz deploy direto em produção. O job `promote` é removido.

**Fluxo revisado:**

```
unit-tests
    └── build-and-deploy (preview)
            └── e2e-tests
                    └── deploy-production (novo build com vars de produção)
```

### Workflow atualizado (`.github/workflows/cd.yml`)

```yaml
name: Continuous Deployment Workflow

on:
  push:
    branches:
      - main

env:
  NODE_VERSION: '24'
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_SCOPE: nelsoonmendees-projects

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6.0.2
      - uses: actions/setup-node@v6.4.0
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: corepack enable
      - run: yarn install
      - run: yarn test:unit

  build-and-deploy:
    name: Build and Deploy Vercel Preview
    runs-on: ubuntu-latest
    needs: unit-tests
    outputs:
      deployment-url: ${{ steps.deploy.outputs.deployment-url }}
    steps:
      - uses: actions/checkout@v6.0.2
      - uses: actions/setup-node@v6.4.0
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: corepack enable
      - run: yarn install
      - name: Pull Vercel Preview Config
        run: yarn vercel pull --yes --environment=preview --token=$VERCEL_TOKEN --scope=$VERCEL_SCOPE
      - name: Build application (preview vars)
        run: yarn vercel build --token=$VERCEL_TOKEN
      - name: Deploy to Vercel Preview
        id: deploy
        run: |
          URL=$(yarn --silent vercel deploy --prebuilt --target=preview --token=$VERCEL_TOKEN --scope=$VERCEL_SCOPE)
          echo "deployment-url=$URL" >> $GITHUB_OUTPUT

  e2e-tests:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    needs: build-and-deploy
    steps:
      - uses: actions/checkout@v6.0.2
      - uses: actions/setup-node@v6.4.0
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: corepack enable
      - run: yarn install
      - run: yarn playwright install --with-deps chromium
      - name: Run E2E Regression Tests
        run: yarn test
        env:
          BASE_URL: ${{ needs.build-and-deploy.outputs.deployment-url }}
      - name: Upload Playwright Test Artifacts
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v7.0.1
        with:
          name: playwright-report
          path: playwright-report
      - name: Publish Testdino Report
        if: ${{ !cancelled() }}
        run: npx tdpw upload ./playwright-report --token=${{ secrets.TESTDINO_TOKEN }}

  # Job novo: build limpo com variáveis de PRODUÇÃO, deploy direto em produção
  deploy-production:
    name: Build and Deploy to Production
    runs-on: ubuntu-latest
    needs: [build-and-deploy, e2e-tests]
    steps:
      - uses: actions/checkout@v6.0.2
      - uses: actions/setup-node@v6.4.0
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: corepack enable
      - run: yarn install
      - name: Pull Vercel Production Config
        run: yarn vercel pull --yes --environment=production --token=$VERCEL_TOKEN --scope=$VERCEL_SCOPE
      - name: Build application (production vars)
        run: yarn vercel build --prod --token=$VERCEL_TOKEN
      - name: Deploy to Vercel Production
        run: yarn vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN --scope=$VERCEL_SCOPE
```

---

## Por que esta abordagem e não as alternativas

| Alternativa | Motivo para descartar |
|---|---|
| `vercel promote` do build de preview | Bundle tem vars de preview hardcoded — produção ficaria apontando para Supabase errado |
| Variáveis de runtime (window.__env__) | Requer mudança arquitetural no front; foge do escopo e adiciona complexidade desnecessária |
| Build único com placeholder + substituição no deploy | Frágil, não suportado nativamente pela Vercel, e viola o princípio de builds reproduzíveis |
| **Build dedicado por ambiente (escolhida)** | Cada ambiente tem seu próprio bundle com as vars corretas; simples, idiomático na Vercel, sem hacks |

O custo é um build a mais por push em `main`, mas garante isolamento total e rastreabilidade clara de qual build foi para produção.

---

## Critérios de aceitação — checklist de validação

- [ ] Dois projetos Supabase existem e têm as mesmas migrations e Edge Functions
- [ ] Um pedido criado pelo Playwright no E2E (contra a URL de preview) **não aparece** no banco de produção
- [ ] Após o deploy-production, a aplicação em produção lê/escreve no banco de produção
- [ ] Os testes E2E continuam passando (o `BASE_URL` ainda aponta para a URL de preview)
- [ ] Nenhuma credencial foi commitada; tudo está nas secrets do GitHub e nas env vars da Vercel
- [ ] O report do Testdino/Playwright continua sendo publicado corretamente
