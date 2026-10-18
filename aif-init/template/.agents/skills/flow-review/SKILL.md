---
name: flow-review
description: Etapa Review do fluxo. Use quando um PR estiver pronto — pré-revisa contra spec/plan e prepara um resumo curto para a revisão humana.
---

# /flow-review <id>

**Entrada:** PR + `spec.md` + `plan.md` de `tasks/active/<id>-*/`.
**Saída:** `tasks/active/<id>-*/review.md`, para o humano decidir rápido.

## Checklist

1. **Intenção:** resolve o problema do `spec.md`? (não só "passa nos testes")
2. **Contrato:** todos os itens de Verificação passaram? Re-rode `verify` se duvidar.
3. **Escopo:** há mudanças fora do plano?
4. **Arquitetura:** respeita invariantes do `DESIGN.md`? Precisava de ADR e tem?
5. **Riscos:** segurança, migração de dados, breaking change, performance.

## Formato do review.md

```md
Veredito: aprovar | ajustes | bloquear
Pontos para o humano olhar: (máx. 5, com arquivo:linha)
O que o agente NÃO conseguiu validar:
```

O merge é sempre do humano. Depois do merge, na main atualizada:
1. `node .agents/aif.mjs done <id>` (move a task para `tasks/complete/`, atualiza status e limpa a branch).
2. Se o projeto usar MCP (Linear, GitHub): marque o card como `Done`/`Closed` no site via MCP.
3. Commite `chore(<id>): close`.
