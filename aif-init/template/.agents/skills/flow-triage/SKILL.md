---
name: flow-triage
description: Etapa Triage do fluxo. Use quando chegar pedido, bug, reclamação ou incidente novo — classifica e registra em tasks/BACKLOG.md.
---

# /flow-triage <descrição do pedido>

**Entrada:** issue, reclamação de usuário, alerta de monitoramento ou pedido do time.
**Saída:** item registrado em `tasks/backlog/` e no `tasks/BACKLOG.md`.

## Passos

1. Deduplique: o item já existe no BACKLOG ou em `tasks/backlog/`? Se sim, só acrescente contexto.
2. Classifique:
   - **tipo:** `bug` | `feature` | `incident` | `chore`
   - **tamanho:** `S` (vai direto p/ Implement) | `M`/`L` (precisa Research + Plan)
   - **prioridade:** `P0` (agora) | `P1` (este ciclo) | `P2` (algum dia)
3. Escreva a **intenção** em 1 linha (o problema, não a solução).
4. Registre rodando (garante id, template e formato):
   ```bash
   node .agents/aif.mjs new "<intenção>" --type <tipo> --size <S|M|L> --prio <P0|P1|P2>
   ```
5. **Rastreamento via MCP:** Se o projeto usar MCP (Linear, GitHub Issues, Jira), crie ou
   vincule a issue no site via MCP e anote o ID/link no `task.md`.
6. Se for `incident P0`, avise o humano imediatamente.

## Não faça

- Não proponha solução técnica — isso é da etapa `flow-plan`.
- Não altere o `BACKLOG.md` manualmente.
