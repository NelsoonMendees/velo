---
title: Plano de Testes Unitários — configuratorStore
file: src/store/configuratorStore.ts
date: 2026-05-04
---

## Objetivo

Criar uma estrutura inicial de testes unitários para `configuratorStore.ts`. Não se trata de cobertura total, mas de estabelecer a prática e o padrão para o time.

---

## Dependências instaladas

```bash
yarn add -D vitest @vitest/coverage-v8 jsdom @testing-library/jest-dom
```

---

## Configuração — `vite.config.ts`

Adicionar o bloco `test`:

```ts
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
}
```

---

## Scripts — `package.json`

```json
"test:unit": "vitest run",
"test:unit:watch": "vitest"
```

---

## Arquivo de setup — `src/test/setup.ts`

```ts
import '@testing-library/jest-dom'

beforeEach(() => {
  localStorage.clear()
})
```

> O middleware `persist` do Zustand usa `localStorage`. O jsdom já o fornece; limpar antes de cada teste evita vazamento de estado entre testes. Não é necessário mockar o middleware.

---

## Arquivo de testes — `src/test/configuratorStore.test.ts`

Para testes do store, usar `useConfiguratorStore.getState()` / `setState()` diretamente, sem `renderHook` — a lógica não tem dependência do React.

### Grupo 1 — `calculateTotalPrice` (4 testes)

| # | Cenário | Expectativa |
|---|---------|-------------|
| 1 | Config padrão (aero, sem opcionais) | `40000` |
| 2 | Rodas sport, sem opcionais | `42000` |
| 3 | Aero + `precision-park` | `45500` |
| 4 | Sport + todos os opcionais | `52500` |

### Grupo 2 — `calculateInstallment` e `formatPrice` (3 testes)

| # | Cenário | Expectativa |
|---|---------|-------------|
| 5 | `calculateInstallment(40000)` retorna número positivo | `> 0` |
| 6 | Resultado arredondado a 2 casas decimais | `value === Math.round(value * 100) / 100` |
| 7 | `formatPrice(40000)` contém `R$` e `40.000` | `toContain('R$')` e `toContain('40.000')` |

### Grupo 3 — Ações do store (3 testes)

| # | Cenário | Expectativa |
|---|---------|-------------|
| 8 | `setExteriorColor('midnight-black')` | Atualiza cor e define `viewMode = 'exterior'` |
| 9 | `toggleOptional('precision-park')` duas vezes | Adiciona na 1ª chamada, remove na 2ª |
| 10 | `login` com email de pedido existente + `logout` | `login` retorna `true`, seta email; `logout` limpa |

---

## Próximos passos sugeridos

Os seguintes cenários foram omitidos intencionalmente para manter o escopo inicial. Seguem o mesmo padrão dos testes acima e podem ser adicionados incrementalmente:

- `setInteriorColor` — atualiza cor e define `viewMode = 'interior'`
- `setWheelType` — atualiza tipo de roda
- `resetConfiguration` — restaura estado padrão
- `addOrder` / `getUserOrders` — persistência e filtragem de pedidos
- `login` com email sem pedidos — deve retornar `false`
