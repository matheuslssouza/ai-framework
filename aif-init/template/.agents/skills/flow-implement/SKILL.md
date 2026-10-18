---
name: flow-implement
description: Etapas Implement e Verify do fluxo. Use para executar o plan.md de um item — só conclui quando o contrato de verificação passa.
---

# /flow-implement <id>

**Entrada:** `tasks/active/<id>-*/plan.md` (ou, para item `S`, a linha do BACKLOG).
**Saída:** código + checkboxes do plano marcados + PR aberto.

## Loop

```
já está na branch da task?  não → node .agents/aif.mjs start <id>   (paralelo: --worktree)
node .agents/aif.mjs status <id> doing
se houver MCP (Linear/GitHub): atualize o card no site para "In Progress"
para cada passo do plan.md:
    implemente → rode testes relacionados → marque [x] → commit
rode a skill `verify`  → FAIL? corrija e repita
git push -u origin HEAD  → abra o PR
node .agents/aif.mjs status <id> review
```

## Regras

- **Uma task = uma branch** (`feat|fix|chore/<id>-<slug>`, criada pelo `aif start`). Nunca commite na main.
- Commits pequenos, um por passo do plano: `<tipo>(<id>): <o que mudou>` — ex.: `feat(001): endpoint de reset`.
- PR: título `<tipo>: <intenção> (#<id>)`; corpo com o que mudou, link para o `plan.md` e saída do `verify`.
- Fique no escopo. Achou algo fora? `node .agents/aif.mjs new "<intenção>"` — não conserte agora.
- Plano errado ou impossível? **Pare** e reporte — não improvise outra solução.
- `adr: necessário`? Rode a skill `adr` e atualize `DESIGN.md` antes do PR.
