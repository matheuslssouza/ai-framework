---
name: aif-init
description: Inicializa o framework de fluxo para agentes (AGENTS.md, DESIGN.md, ADRs, skills flow-*) em um projeto novo ou existente. Use quando o usuário pedir para iniciar/configurar o projeto para agentes, rodar /aif-init, ou criar AGENTS.md. Em projeto novo entrevista o usuário; em projeto existente analisa o código.
---

# /aif-init

Gera a estrutura padronizada **e** preenche com o conteúdo real do projeto.
Script = estrutura (sempre igual). Você = conteúdo (entrevista ou análise).

`AIF` abaixo = `node <diretório desta skill>/scripts/aif.mjs`.
Depois do init, o projeto tem sua própria cópia: `node .agents/aif.mjs` (ou `.claude/aif.mjs`).

## 1. Diagnóstico

Rode `AIF detect <dir-do-projeto>`: veja `mode`, backlog local prévio e MCP/site externo:

| mode | Caminho |
|---|---|
| `new` | §2A — entrevista (pergunte estilo de backlog: subpastas ou MCP) |
| `existing` | §2B — análise; se houver backlog local, `init` copia automaticamente |
| `initialized` | Já tem AGENTS.md. Pergunte: atualizar (merge, mostre diff) ou abortar. |

Pergunte também qual ferramenta: Antigravity (`.agents/`) ou Claude Code (`.claude/`).

## 2A. Projeto novo — entrevista

Siga [references/interview-new.md](references/interview-new.md). Regras:
- **Ordem fixa:** Objetivo & contexto → Arquitetura → Design & convenções → Fluxo & Backlog/MCP.
- **Rodadas curtas:** no máx. 4 perguntas por vez; sempre com opção "(Recomendado)".
- Ao fim de cada bloco, devolva um resumo de 3–5 linhas e confirme antes de seguir.

## 2B. Projeto existente — análise

Siga [references/analyze-existing.md](references/analyze-existing.md).
Apresente o que inferiu (stack, comandos, backlog local detectado, MCP para marcar no site)
e pergunte **só** o que o código não responde (invariantes, áreas legadas, regras do negócio).

## 3. Confirmar o plano de geração

Antes de escrever, mostre um resumo único:
- objetivo em 1 frase, stack, módulos, comandos;
- gestão de backlog: tarefas locais migradas, subpastas actives/backlog/complete, ou MCP no site;
- lista de ADRs que serão criados (uma decisão estrutural = um ADR).
Só gere após o "ok".

## 4. Gerar

1. `AIF init <dir> --tool <antigravity|claude>` — copia estrutura (`tasks/backlog`, `active`, `complete`),
   migra tarefas locais prévias automaticamente se existirem e detecta comandos.
2. Preencha `AGENTS.md`: Projeto, Comandos, Convenções e MCP/Backlog. Remova `<placeholder>`.
3. Preencha `DESIGN.md`: visão geral, diagrama, módulos, fluxos críticos, invariantes.
4. Para cada decisão estrutural: `node .agents/aif.mjs adr "<título>"`, preencha, status `Aceito`.
5. Projeto novo: registre o setup inicial no backlog:
   `node .agents/aif.mjs new "<intenção>" --size <S|M|L> --prio <P0|P1|P2>`.
6. `node .agents/aif.mjs check` deve passar.

## 5. Encerrar

Mostre a árvore criada, os ADRs gerados e o próximo passo sugerido
(normalmente `/flow-plan 001`). Se ficou alguma lacuna, liste em 1–3 bullets.

## Não faça

- Não sobrescreva tarefas locais existentes — migre/copie sempre.
- Não ultrapasse os limites (AGENTS.md 150, DESIGN.md 200, ADR 40 linhas, skill 80 linhas).
- Não invente respostas que o usuário não deu.
