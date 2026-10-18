# AGENTS.md

> Ponto de entrada para qualquer agente de IA. Mantenha **< 150 linhas**.
> Aqui ficam só regras estáveis e ponteiros. Detalhes vivem onde são usados.

## Projeto

- **O quê:** <uma frase sobre o produto>
- **Stack:** <linguagem, framework, banco>
- **Arquitetura atual:** ver [DESIGN.md](DESIGN.md) (fonte da verdade).
- **Decisões passadas:** ver [docs/adr/](docs/adr/) (só leia o ADR relevante à tarefa).

## Comandos

```bash
<install>     # instalar dependências
<dev>         # rodar local
<test>        # testes  — obrigatório antes de concluir qualquer tarefa
<lint>        # lint/format
```

## Fluxo de trabalho

Todo trabalho não trivial segue o fluxo abaixo. Cada etapa é uma skill (também invocável como comando).

```
Backlog → Triage → Research → Plan → Implement ⇄ Verify → Review → Done
       /flow-triage  /flow-plan <id>  /flow-implement <id>  /flow-review <id>
                    [humano]                                [humano]
```

| Etapa | Skill | Artefato (em `tasks/`) | Gate humano? |
|---|---|---|---|
| Triage | `flow-triage` | linha no `BACKLOG.md` + `backlog/` | não |
| Research | `flow-plan` | `active/<id>-*/spec.md` | **sim** — aprova direção |
| Plan | `flow-plan` | `active/<id>-*/plan.md` | opcional |
| Implement/Verify | `flow-implement` | código + checkboxes do `plan.md` | não |
| Review | `flow-review` | `active/<id>-*/review.md` | **sim** — valida e faz merge |

Tarefa trivial (typo, bump, ajuste de 1 arquivo)? Pule direto para Implement.

**Rastreamento & MCP:** Se o projeto usar MCP (Linear, GitHub, Jira) para marcar no site,
use as ferramentas MCP disponíveis para ler, atualizar status e fechar tarefas remotamente.

**Partes mecânicas usam o CLI** (nunca crie ids, pastas ou ADRs à mão):
`node .agents/aif.mjs new | plan | status | start | adr | done | check` — rode sem argumentos para ajuda.

**Git:** uma task = uma branch `feat|fix|chore/<id>-<slug>` (via `aif start`), um PR, nunca commit na main.
Commits: `<tipo>(<id>): <mudança>`. Tasks em paralelo: `aif start <id> --worktree`.

## Regras

1. **Leia sob demanda.** Não carregue todos os docs. Abra apenas o que a tarefa exige.
2. **Contrato de verificação é lei.** Uma tarefa só termina quando todos os itens de
   `## Verificação` do `plan.md` passam. Rode a skill `verify`.
3. **Não invente.** Se a intenção não estiver clara no `spec.md`, pare e pergunte.
4. **Escopo fechado.** Não refatore fora do que o `plan.md` pede. Anote ideias no `BACKLOG.md`.
5. **Decisão estrutural = ADR.** Mudou arquitetura, lib central ou contrato público?
   Use a skill `adr` e atualize `DESIGN.md` no mesmo PR.
6. **Ciclo de tasks.** Ao concluir um item, `node .agents/aif.mjs done <id>` move para `tasks/complete/`
   (histórico preservado) e limpa a branch.

## Convenções de código

- <ex: TypeScript strict, sem `any`>
- <ex: testes ao lado do código: `foo.ts` / `foo.test.ts`>
- <ex: commits no formato Conventional Commits>

## Onde fica cada coisa

```
AGENTS.md            este arquivo
DESIGN.md            arquitetura atual (estado presente, não histórico)
docs/adr/            decisões imutáveis (o "porquê" histórico)
tasks/BACKLOG.md     fila consolidada de todas as tasks
tasks/backlog/       tasks aguardando início/refinamento
tasks/active/        tasks em andamento (actives: spec, plan, review)
tasks/complete/      tasks concluídas (histórico e evidências)
tasks/_templates/    templates de task.md, spec.md e plan.md
.agents/skills/      etapas do fluxo (flow-*) + procedimentos (verify, adr)
.agents/aif.mjs      CLI para as partes mecânicas
```
