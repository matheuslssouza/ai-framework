---
name: adr
description: Cria um Architecture Decision Record em docs/adr/. Use quando uma decisão mudar arquitetura, dependência central ou contrato público.
---

# ADR

## Quando criar

Sim: trocar banco/lib central, novo módulo, mudar contrato de API, padrão novo de código.
Não: bugfix, refactor local, detalhes de implementação.

## Passos

1. Gere o arquivo (numeração, data e índice automáticos):
   ```bash
   node .agents/aif.mjs adr "<título no imperativo>"
   ```
2. Preencha em **≤ 40 linhas**. Contexto e consequências são o mais importante.
3. Substitui um ADR antigo? No antigo, mude **só** o status para `Substituído por NNNN`.
   Nunca reescreva o conteúdo de um ADR aceito — ele é histórico.
4. Atualize `DESIGN.md` para refletir o novo estado.
5. Quando o humano aprovar o PR, mude o status para `Aceito` (arquivo e índice).
