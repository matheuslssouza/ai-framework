---
name: flow-plan
description: Etapas Research e Plan do fluxo. Use para um item do backlog de tamanho M/L — escreve spec.md, espera aprovação humana, depois plan.md com contrato de verificação.
---

# /flow-plan <id>

Duas fases, com **gate humano entre elas**.
Ao iniciar o planejamento, a task passa para `tasks/active/<id>-*/`.

**Antes de tudo:** `node .agents/aif.mjs start <id>` — a branch da task nasce aqui, a pasta
vai para `tasks/active/` e `spec.md`/`plan.md` vão junto no PR para o revisor ver tudo no mesmo lugar.
Se usar MCP (Linear, GitHub), marque o card como planejado ou em andamento no site.

## Fase 1 — Research → `spec.md`

1. Leia só o necessário: `DESIGN.md`, ADRs citados no índice, código tocado.
2. Preencha o `spec.md` na pasta `tasks/active/`: intenção, fora de escopo, contexto atual, opções, recomendação.
3. **Pare.** Peça ao humano para aprovar a direção. Não avance sem `[x] Humano aprovou`.

## Fase 2 — Plan → `plan.md`

1. Crie o plano: `node .agents/aif.mjs plan <id>` (copia o template para `tasks/active/`).
2. Quebre em passos pequenos (cada um = um commit possível).
3. Escreva **Verificação**: comandos e checks objetivos que provam que está pronto.
   Ruim: "funciona bem". Bom: "`npm test -- auth` passa; `POST /login` sem senha → 400".
4. Solução estrutural? Marque `adr: necessário` no topo.
5. `node .agents/aif.mjs status <id> todo`.

## Não faça

- Não escreva código de produção.
- Não deixe a Verificação vaga — `flow-implement` depende dela.
