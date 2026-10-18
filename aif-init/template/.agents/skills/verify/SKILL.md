---
name: verify
description: Executa o contrato de verificação do plan.md e reporta pass/fail com evidência. Use antes de declarar qualquer tarefa concluída.
---

# Verify

1. Abra `work/<id>/plan.md` e localize a seção `## Verificação`.
2. Rode **sempre** a base do projeto (ver comandos no `AGENTS.md`): `<lint>` e `<test>`.
3. Para cada item do contrato:
   - comando → rode e capture a saída relevante;
   - check manual/comportamental → execute (curl, script, teste e2e) e registre o resultado.
4. Marque `[x]` apenas no que passou **com evidência**. Nunca marque por suposição.
5. Responda neste formato:

```
VERIFY: PASS | FAIL
- [x] <item> — <evidência curta>
- [ ] <item> — <erro / por que falhou>
```

Se FAIL: volte a implementar. Se o item do contrato for impossível de cumprir, pare e reporte ao humano.
