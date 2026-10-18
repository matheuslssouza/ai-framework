# Entrevista — projeto novo

Banco de perguntas. **Não faça todas**: escolha as relevantes, máx. 4 por rodada,
sempre com opção recomendada. Cada bloco termina com resumo + confirmação.

## Bloco 1 — Objetivo & contexto (sempre primeiro)

Vira: `AGENTS.md > Projeto` e `DESIGN.md > Visão geral`.

1. Qual problema o projeto resolve, e para quem?
2. Como é o sucesso? (métrica ou resultado observável)
3. Que tipo de projeto é? protótipo/MVP · produto em produção · ferramenta interna · lib/SDK · estudo
4. O que entra na v1 e o que fica **fora** explicitamente?
5. Restrições: prazo, orçamento, time (sozinho? quantos devs?), compliance/LGPD, infra obrigatória.
6. Existe algo parecido que serve de referência (produto, repo, design)?

## Bloco 2 — Arquitetura

Vira: `DESIGN.md > Módulos/Diagrama` + **um ADR por decisão**.
Recomende com base no Bloco 1 (ex.: MVP solo → monólito simples, stack que o usuário já domina).

1. Forma de entrega: web app · API · CLI · mobile · desktop · lib · worker/automação
2. Stack: linguagem e framework principal (pergunte o que o usuário já domina antes de sugerir).
3. Dados: precisa persistir? relacional · documento · arquivo/SQLite · nenhum
4. Estilo: monólito modular · serviços separados · serverless
5. Integrações externas: pagamentos, auth (próprio/OAuth/provedor), e-mail, IA/LLM, filas…
6. Deploy/hosting: local · VPS · PaaS (Vercel/Render/Fly) · cloud (AWS/GCP/Azure) · ainda não sei
7. Requisitos não-funcionais relevantes: volume esperado, latência, offline, multi-tenant.

## Bloco 3 — Design & convenções

Vira: `AGENTS.md > Convenções` e `DESIGN.md > Invariantes`.

1. Organização de pastas: por camada (`api/domain/infra`) · por feature (`features/x`) — recomende uma.
2. Testes: unitário + integração? e2e? meta mínima? (recomende "testes nos fluxos críticos")
3. Lint/format: padrão da stack (ex.: ESLint+Prettier, Ruff, gofmt)?
4. Commits/branch: Conventional Commits? trunk-based ou PR por feature?
5. **Se tiver UI:** design system/lib de componentes (shadcn, MUI, Tailwind puro…)? tema, acessibilidade,
   responsivo/mobile-first? Referências visuais? → seção `## UI` curta no `DESIGN.md`.
6. Regras de ouro do domínio (invariantes): ex. "valores monetários em centavos", "nunca deletar, só arquivar".

## Bloco 4 — Fluxo de trabalho & Backlog

Vira: ajustes no `AGENTS.md > Fluxo` e formato das tarefas.

1. **Gestão do Backlog:**
   - (Recomendado) Subpastas locais: `tasks/backlog/`, `tasks/active/`, `tasks/complete/` + `tasks/BACKLOG.md` resumido.
   - Arquivo único: apenas `tasks/BACKLOG.md` (tabela simples para projetos pequenos).
   - Externo com MCP: usa Linear, GitHub Issues ou Jira via ferramentas MCP para marcar tarefas no site?
2. Quem aprova os gates humanos (spec e merge)? Só você ou um time?
3. Vai ter CI? Rodar `aif check` + testes no CI? (recomende sim)
4. Algo que o agente **nunca** deve fazer sem perguntar? (ex.: migrações, deploy, apagar dados)

## Saída esperada da entrevista

Um resumo assim, para confirmação no passo 3 da skill:

```
Objetivo: <1 frase>
Tipo: <MVP | produto | ...>   v1: <3 bullets>   Fora: <bullets>
Stack: <...>   Dados: <...>   Deploy: <...>
Backlog & MCP: <subpastas locais tasks/{active,backlog,complete} | arquivo único | MCP Linear/GitHub>
ADRs: 0002 Usar <stack> · 0003 Usar <banco> · 0004 Organizar por <feature/camada>
Backlog inicial: 001 setup do projeto (S) · 002 <feature v1> (M) · ...
```
