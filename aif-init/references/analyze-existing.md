# Análise — projeto existente

Objetivo: preencher o máximo **a partir do código**, e perguntar só as lacunas.

## 1. Ler (barato → caro, pare quando tiver o suficiente)

1. `AIF detect` → manifests, comandos, pastas de topo, backlog local e MCPs.
2. `README*`, manifests (`package.json`, `pyproject.toml`, `go.mod`…) → objetivo, stack, scripts.
3. Configs: CI (`.github/workflows`, `.gitlab-ci.yml`), lint/format, `Dockerfile`, `docker-compose`, `.env.example`.
4. Árvore de `src/` (2–3 níveis) → módulos e estilo (camada vs feature).
5. Entry points (main, rotas, handlers) → fluxos críticos.
6. Testes: onde ficam, framework, cobertura aparente.
7. `git log --oneline -n 30` → convenção de commits e áreas mais ativas.
8. Docs existentes (`docs/`, wiki no repo, ADRs antigos) → reaproveite, não duplique.
9. **Backlog & MCP:** verifique se já existem tarefas locais (`.agents/tasks`, `tasks/`, `planejamento/`, `TODO.md`) e ferramentas MCP configuradas (GitHub, Linear, Jira).

## 2. Inferir

| Campo | De onde |
|---|---|
| Stack + comandos | manifests, CI |
| Módulos / "Não deve" | árvore + imports entre pastas |
| Convenções | lint config, padrão dos arquivos, git log |
| Invariantes | tipos/validações recorrentes, comentários "NUNCA/IMPORTANT" |
| Backlog & Rastreamento | pastas locais de tasks + MCPs detectados no ambiente |
| ADRs retroativos | escolhas estruturais evidentes (banco, framework, arquitetura) |

ADR retroativo: status `Aceito`, contexto "decisão anterior à adoção do framework; inferida do código".
Crie só para as 2–4 decisões mais importantes.

## 3. Perguntar (só lacunas, máx. 4 por rodada)

Apresente primeiro o que você inferiu, depois pergunte, por exemplo:

1. O objetivo do produto é "<inferido>"? Quem usa?
2. Há áreas legadas que não devem ser estendidas?
3. Alguma regra de negócio que o código não deixa óbvia (invariante)?
4. Backlog: se usar sistema externo ou MCP (GitHub, Linear, Jira), deseja que o agente marque e feche tarefas diretamente no site via MCP?
5. Algo que o agente nunca deve fazer sem perguntar? (migrações, deploy, libs novas)

## 4. Cuidados

- **Backlog local existente? Caso tenha local, só copiar:** não recrie do zero nem descarte.
  O `aif init` migra automaticamente as tarefas para a estrutura com subpastas `tasks/backlog/`,
  `tasks/active/` e `tasks/complete/`, populando o `tasks/BACKLOG.md`.
- Já existe `README`/docs? **Não duplique**: `DESIGN.md` aponta para eles quando fizer sentido.
- Já existe `CLAUDE.md`/`.cursorrules`/similar? Migre as regras úteis para o `AGENTS.md` e
  pergunte se pode remover o antigo (evita duas fontes da verdade).
- Divergência entre README e código? O código vence; anote a lacuna para o usuário.
