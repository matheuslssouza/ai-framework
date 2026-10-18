# 0001. Usar ADRs para decisões de arquitetura

- **Status:** Aceito
- **Data:** 2026-10-18

## Contexto

Agentes de IA e pessoas novas não sabem por que o sistema é como é, e acabam
"corrigindo" decisões intencionais. Docs longos ficam desatualizados e poluem o contexto.

## Decisão

Registrar decisões estruturais como ADRs curtos e imutáveis em `docs/adr/`,
e manter o estado atual apenas em `DESIGN.md`.

## Alternativas consideradas

- Wiki externa — fora do repo, agentes não leem, desatualiza.
- Um doc de arquitetura único com histórico — cresce sem limite.

## Consequências

- (+) Histórico do "porquê" barato e versionado com o código.
- (−) Exige disciplina de criar ADR no mesmo PR da mudança.
