## 🧠 Prompt para Claude Code

Atue como um desenvolvedor sênior com experiência em debugging de aplicações web (frontend + backend).

---

## 🎯 Objetivo
Investigar uma inconsistência entre o status do pedido persistido no banco de dados e o status exibido na página de sucesso após envio de proposta.

---

## 📌 Contexto do problema
- **Cenário:** CT07  
- **Condição:** cliente com score entre 501 e 700 pontos  
- **Comportamento esperado:**  
  - Status do pedido = `"EM_ANALISE"` tanto no banco quanto na interface  

- **Comportamento atual:**  
  - Banco de dados: status correto (`EM_ANALISE`)  
  - Frontend (página de sucesso): o status exibido é "Credito Reprovado"

---

## 🛠️ Tarefas

### 1. Mapear o fluxo do status
- Backend → API → Frontend  
- Identificar exatamente onde ocorre a divergência:
  - Transformações de dados
  - Mapeamento de enums
  - Adapters / DTOs
  - Regras condicionais

---

### 2. Levantar hipóteses técnicas (causa raiz)
Considere possíveis problemas como:
- Serialização ou mapeamento incorreto de enums  
- Lógica condicional no frontend sobrescrevendo o status  
- Divergência no contrato da API  
- Cache ou estado desatualizado (stale state)  
- Feature flags ou regras específicas por score  
- Fallbacks indevidos (default status)

---

### 3. Validar a hipótese mais provável
- Basear a análise no contexto fornecido  
- Justificar tecnicamente a escolha  

---

### 4. Propor correção
- Indicar exatamente onde corrigir:
  - Backend, frontend ou ambos  
- Explicar a mudança de forma objetiva  
- Garantir que não impacta outros cenários  

---

### 5. Exemplo de código
- Apresentar **antes/depois** da correção  
- Preferencialmente em formato **diff**

---

### 6. Plano de testes

#### ✔️ Teste manual (passo a passo)
1. Simular cliente com score entre 501–700  
2. Enviar proposta  
3. Validar status exibido na UI  

---

## 📦 Formato da resposta esperado
- Diagnóstico  
- Causa raiz (hipótese principal)  
- Correção proposta  
- Exemplo de código  
- Plano de testes  

---

## ⚠️ Importante
Não implemente a solução diretamente.  
Apenas proponha a correção e aguarde aprovação.