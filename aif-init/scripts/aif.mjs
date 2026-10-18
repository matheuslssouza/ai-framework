#!/usr/bin/env node
// aif — scaffolding determinístico do framework. Zero dependências.
// Regra: o que é mecânico (ids, nomes, templates, limites) é script; o que exige julgamento é skill.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();
const LIMITS = { 'AGENTS.md': 150, 'DESIGN.md': 200, skill: 80, adr: 40 };
const STATUSES = ['inbox', 'backlog', 'research', 'plan', 'todo', 'doing', 'review', 'done'];

// ---------- utils ----------
const die = (msg) => { console.error(`✖ ${msg}`); process.exit(1); };
const ok = (msg) => console.log(`✔ ${msg}`);
const git = (args) => execSync(`git ${args}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const tryGit = (args) => { try { return git(args); } catch { return null; } };
const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, c) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c, 'utf8'); };
const exists = (p) => fs.existsSync(p);
const today = () => new Date().toISOString().slice(0, 10);
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const lines = (p) => read(p).split('\n').length;

function parseArgs(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      opt[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    } else pos.push(argv[i]);
  }
  return { pos, opt };
}

// ---------- tasks root & backlog ----------
function getTasksRoot(rootDir = ROOT) {
  const tasksDir = path.join(rootDir, 'tasks');
  const workDir = path.join(rootDir, 'work');
  if (exists(tasksDir)) return tasksDir;
  if (exists(workDir)) return workDir;
  return tasksDir;
}

function getBacklogFile(rootDir = ROOT) {
  const primary = path.join(getTasksRoot(rootDir), 'BACKLOG.md');
  if (exists(primary)) return primary;
  const legacy = path.join(rootDir, 'work', 'BACKLOG.md');
  if (exists(legacy)) return legacy;
  return primary;
}

const ROW = /^\|\s*(\d{3})\s*\|\s*(\w+)\s*\|\s*(\w+)\s*\|\s*(P\d)\s*\|\s*(\w+)\s*\|\s*(.*?)\s*\|/;

function backlogRows() {
  const file = getBacklogFile();
  if (!exists(file)) die('tasks/BACKLOG.md não encontrado. Rode `aif init` primeiro.');
  return read(file).split('\n').map((l, i) => {
    const m = l.match(ROW);
    return m && { line: i, id: m[1], type: m[2], size: m[3], prio: m[4], status: m[5], intent: m[6].trim() };
  }).filter(Boolean);
}
const fmtRow = (r) => `| ${r.id} | ${r.type} | ${r.size} | ${r.prio} | ${r.status} | ${r.intent} |`;

function updateRow(id, fn) {
  const file = getBacklogFile();
  const all = read(file).split('\n');
  const row = backlogRows().find((r) => r.id === id) || die(`item ${id} não está no BACKLOG.`);
  const next = fn(row);
  if (next === null) all.splice(row.line, 1); else all[row.line] = fmtRow(next);
  write(file, all.join('\n'));
  return row;
}

// Procura por task em subpastas ou arquivo em tasks/, work/ ou .agents/tasks/
function findTask(id, rootDir = ROOT) {
  const searchRoots = [
    { base: path.join(rootDir, 'tasks'), subs: ['active', 'actives', 'backlog', 'complete', 'completed'] },
    { base: path.join(rootDir, 'work'), subs: ['active', 'actives', 'backlog', 'complete', 'completed'] },
    { base: path.join(rootDir, '.agents', 'tasks'), subs: ['active', 'actives', 'backlog', 'completed', 'complete'] }
  ];

  const idPattern = new RegExp(`^(TASK-)?0*${parseInt(id, 10)}([-_.]|$)`, 'i');

  for (const sr of searchRoots) {
    if (!exists(sr.base)) continue;
    // 1. Procurar nas subpastas
    for (const sub of sr.subs) {
      const subDir = path.join(sr.base, sub);
      if (!exists(subDir)) continue;
      const entries = fs.readdirSync(subDir);
      for (const e of entries) {
        if (idPattern.test(e)) {
          const full = path.join(subDir, e);
          const isFile = fs.statSync(full).isFile();
          const category = sub.startsWith('active') ? 'active' : sub.startsWith('complete') ? 'complete' : 'backlog';
          return { path: full, category, subDir, name: e, isFile, isDir: !isFile, rootBase: sr.base };
        }
      }
    }
    // 2. Procurar na raiz do diretório de tarefas
    const rootEntries = fs.readdirSync(sr.base);
    for (const e of rootEntries) {
      if (['active', 'actives', 'backlog', 'complete', 'completed', '_templates', 'BACKLOG.md'].includes(e)) continue;
      if (idPattern.test(e)) {
        const full = path.join(sr.base, e);
        const isFile = fs.statSync(full).isFile();
        return { path: full, category: 'root', subDir: sr.base, name: e, isFile, isDir: !isFile, rootBase: sr.base };
      }
    }
  }
  return null;
}

function moveTask(task, targetCategory, rootDir = ROOT) {
  const targetSub = targetCategory === 'complete' ? 'complete' : targetCategory === 'active' ? 'active' : 'backlog';
  const baseDir = getTasksRoot(rootDir);
  const targetDir = path.join(baseDir, targetSub);
  fs.mkdirSync(targetDir, { recursive: true });
  const dest = path.join(targetDir, task.name);
  if (path.resolve(task.path) === path.resolve(dest)) return dest;
  fs.renameSync(task.path, dest);
  task.path = dest;
  task.category = targetCategory;
  task.subDir = targetDir;
  return dest;
}

function workDir(id) {
  const t = findTask(id);
  if (t) return t.isDir ? t.path : path.dirname(t.path);
  const activeDir = path.join(getTasksRoot(), 'active');
  return exists(activeDir) ? activeDir : getTasksRoot();
}

const BRANCH_PREFIX = { feature: 'feat', bug: 'fix', incident: 'fix', chore: 'chore' };
const branchName = (row) => `${BRANCH_PREFIX[row.type] || 'feat'}/${row.id}-${slug(row.intent)}`;

// ---------- detecção de backlog e mcp ----------
function detectBacklog(dir) {
  const info = {
    local: { exists: false, path: null, taskCount: 0, folders: [] },
    mcp: { configured: false, servers: [] },
    external: null
  };

  const candidates = [
    path.join(dir, 'tasks'),
    path.join(dir, '.agents', 'tasks'),
    path.join(dir, 'work')
  ];

  for (const c of candidates) {
    if (exists(c)) {
      const subs = fs.readdirSync(c).filter((e) => {
        try { return fs.statSync(path.join(c, e)).isDirectory(); } catch { return false; }
      });
      const hasSubs = subs.some((s) => ['active', 'actives', 'backlog', 'complete', 'completed'].includes(s));
      let count = 0;
      if (hasSubs) {
        for (const s of subs) {
          const sPath = path.join(c, s);
          try {
            count += fs.readdirSync(sPath).filter((f) => !f.startsWith('.') && !f.startsWith('_')).length;
          } catch {}
        }
      } else {
        count = fs.readdirSync(c).filter((f) => !f.startsWith('.') && !f.startsWith('_')).length;
      }
      if (count > 0 || hasSubs) {
        info.local = { exists: true, path: path.relative(dir, c), taskCount: count, folders: subs };
        break;
      }
    }
  }

  if (!info.local.exists) {
    const planDir = path.join(dir, 'planejamento');
    const todoFile = path.join(dir, 'TODO.md');
    if (exists(planDir)) {
      const files = fs.readdirSync(planDir).filter((f) => f.endsWith('.md'));
      if (files.length) info.local = { exists: true, path: 'planejamento', taskCount: files.length, folders: [] };
    } else if (exists(todoFile)) {
      info.local = { exists: true, path: 'TODO.md', taskCount: 1, folders: [] };
    }
  }

  const mcpFiles = [
    path.join(dir, '.agents', 'mcp.json'),
    path.join(dir, 'mcp.json'),
    path.join(dir, '.vscode', 'mcp.json'),
    path.join(process.env.USERPROFILE || process.env.HOME || '', '.gemini', 'antigravity', 'mcp_config.json')
  ];

  const trackerKeywords = ['github', 'linear', 'jira', 'gitlab', 'clickup', 'notion', 'trello', 'azure-devops'];
  const foundServers = new Set();

  for (const mf of mcpFiles) {
    if (exists(mf)) {
      try {
        const parsed = JSON.parse(read(mf));
        const srvs = Object.keys(parsed.mcpServers || parsed.servers || {});
        for (const s of srvs) {
          foundServers.add(s);
          const lower = s.toLowerCase();
          if (trackerKeywords.some((k) => lower.includes(k))) info.external = s;
        }
      } catch {}
    }
  }

  if (foundServers.size) {
    info.mcp = { configured: true, servers: Array.from(foundServers) };
  }

  if (!info.external) {
    if (exists(path.join(dir, '.github'))) info.external = 'github-issues';
    else if (exists(path.join(dir, '.linear'))) info.external = 'linear';
  }

  return info;
}

// Copia/migra tarefas locais existentes para tasks/
function copyLocalTasks(sourcePath, targetBase) {
  let copied = 0;
  const importedRows = [];

  const subMap = {
    active: ['active', 'actives'],
    backlog: ['backlog'],
    complete: ['complete', 'completed']
  };

  const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

  const parseTaskMeta = (filePath, fallbackId) => {
    try {
      const c = read(filePath);
      const idMatch = c.match(/id:\s*(TASK-\d+|\d+)/i) || c.match(/^#\s*(TASK-\d+|\d+)/m);
      const titleMatch = c.match(/title:\s*(.*)/i) || c.match(/^#\s*(?:TASK-)?\d+\s*[—–-]\s*(.*)/m);
      const typeMatch = c.match(/type:\s*(\w+)/i);
      const prioMatch = c.match(/prio:\s*(P\d)/i);
      const id = String(idMatch ? idMatch[1].replace(/\D/g, '') : fallbackId).padStart(3, '0');
      const intent = (titleMatch ? titleMatch[1] : path.basename(filePath, '.md')).replace(/\|/g, '/').trim();
      const type = typeMatch ? typeMatch[1] : 'feature';
      const prio = prioMatch ? prioMatch[1] : 'P1';
      return { id, intent, type, prio };
    } catch {
      return { id: String(fallbackId).padStart(3, '0'), intent: path.basename(filePath, '.md'), type: 'feature', prio: 'P1' };
    }
  };

  for (const [targetCategory, aliases] of Object.entries(subMap)) {
    const targetDir = path.join(targetBase, targetCategory);
    fs.mkdirSync(targetDir, { recursive: true });

    for (const alias of aliases) {
      const srcSub = path.join(sourcePath, alias);
      if (!exists(srcSub)) continue;

      const entries = fs.readdirSync(srcSub);
      for (const e of entries) {
        if (e.startsWith('.') || e.startsWith('_')) continue;
        const srcFull = path.join(srcSub, e);
        const destFull = path.join(targetDir, e);
        if (isDir(srcFull)) {
          fs.cpSync(srcFull, destFull, { recursive: true });
        } else {
          write(destFull, read(srcFull));
          const meta = parseTaskMeta(srcFull, copied + 1);
          const status = targetCategory === 'complete' ? 'done' : targetCategory === 'active' ? 'doing' : 'backlog';
          importedRows.push({ ...meta, size: 'M', status });
        }
        copied++;
      }
    }
  }

  if (copied === 0 && exists(sourcePath)) {
    const entries = fs.readdirSync(sourcePath);
    for (const e of entries) {
      if (e.startsWith('.') || e.startsWith('_') || e === 'BACKLOG.md') continue;
      const srcFull = path.join(sourcePath, e);
      const destFull = path.join(targetBase, 'backlog', e);
      if (isDir(srcFull)) {
        fs.cpSync(srcFull, destFull, { recursive: true });
      } else if (e.endsWith('.md')) {
        write(destFull, read(srcFull));
        const meta = parseTaskMeta(srcFull, copied + 1);
        importedRows.push({ ...meta, size: 'M', status: 'backlog' });
      }
      copied++;
    }
  }

  return { copied, importedRows };
}

// ---------- comandos ----------
const commands = {
  install({ opt }) {
    const home = process.env.USERPROFILE || process.env.HOME;
    const dest = opt.tool === 'claude'
      ? path.join(home, '.claude', 'skills', 'aif-init')
      : path.join(home, '.gemini', 'config', 'skills', 'aif-init');
    const src = path.join(HERE, '..');
    for (const f of walk(src)) write(path.join(dest, f.rel), read(f.abs));
    ok(`skill instalada em ${dest} — use "/aif-init" em qualquer projeto.`);
  },

  detect({ pos }) {
    const dir = path.resolve(pos[0] || '.');
    const ignore = /^(\.git|\.agents|\.claude|node_modules|README.*|LICENSE.*|\.gitignore|\.DS_Store)$/i;
    const entries = exists(dir) ? fs.readdirSync(dir).filter((e) => !ignore.test(e)) : [];
    const manifests = ['package.json', 'pyproject.toml', 'requirements.txt', 'go.mod', 'Cargo.toml',
      'pom.xml', 'build.gradle', 'composer.json', 'Gemfile', '*.csproj']
      .filter((m) => m.startsWith('*') ? entries.some((e) => e.endsWith(m.slice(1))) : entries.includes(m));
    const initialized = exists(path.join(dir, 'AGENTS.md')) || exists(path.join(dir, 'CLAUDE.md'));
    const mode = initialized ? 'initialized' : entries.length === 0 ? 'new' : 'existing';
    const backlog = detectBacklog(dir);

    console.log(JSON.stringify({
      dir,
      mode,
      manifests,
      commands: detectCommands(dir),
      hasReadme: fs.existsSync(dir) && fs.readdirSync(dir).some((e) => /^readme/i.test(e)),
      topLevel: entries.slice(0, 30),
      backlog
    }, null, 2));
  },

  init({ pos, opt }) {
    const target = path.resolve(pos[0] || '.');
    const tool = opt.tool || 'antigravity';
    const agentsDir = tool === 'claude' ? '.claude' : '.agents';
    const src = path.join(HERE, '..', 'template');
    if (!exists(src)) die('pasta template/ não encontrada — rode o init a partir do repo do framework.');

    const cmds = detectCommands(target);
    const files = walk(src);
    files.push({ abs: path.join(HERE, 'aif.mjs'), rel: path.join('.agents', 'aif.mjs') });

    let created = 0, skipped = 0;
    for (const f of files) {
      if (f.rel === 'CLAUDE.md' && tool !== 'claude') continue;
      const rel = f.rel.replace(/^\.agents(?=[\\/])/, agentsDir);
      const dest = path.join(target, rel);
      if (exists(dest) && !opt.force) { skipped++; continue; }
      let c = read(f.abs);
      if (f.rel.endsWith('.md')) {
        for (const [k, v] of Object.entries(cmds)) c = c.replaceAll(`<${k}>`, v);
        if (tool === 'claude') c = c.replaceAll('.agents/', '.claude/');
      }
      write(dest, c);
      created++;
    }

    const tasksTarget = path.join(target, 'tasks');
    ['backlog', 'active', 'complete', '_templates'].forEach((sub) => {
      fs.mkdirSync(path.join(tasksTarget, sub), { recursive: true });
    });

    const backlogInfo = detectBacklog(target);
    if (backlogInfo.local.exists && backlogInfo.local.path && !backlogInfo.local.path.startsWith('tasks')) {
      const srcTasks = path.join(target, backlogInfo.local.path);
      const { copied, importedRows } = copyLocalTasks(srcTasks, tasksTarget);
      if (copied > 0) {
        ok(`backlog local detectado: ${copied} tarefas copiadas de ${backlogInfo.local.path} para tasks/.`);
        if (importedRows.length) {
          const backlogFile = path.join(tasksTarget, 'BACKLOG.md');
          let currentContent = exists(backlogFile) ? read(backlogFile) : '';
          const newRows = importedRows.map(fmtRow).join('\n');
          write(backlogFile, currentContent.trimEnd() + '\n' + newRows + '\n');
        }
      }
    }

    ok(`${created} arquivos criados em ${target} (${skipped} já existiam — use --force para sobrescrever).`);
    const found = Object.keys(cmds);
    console.log(found.length ? `  comandos detectados: ${found.join(', ')}` : '  stack não detectada: preencha <install>/<test>/... no AGENTS.md');
    if (backlogInfo.mcp.configured) {
      console.log(`  MCP detectado: ${backlogInfo.mcp.servers.join(', ')} — configure no AGENTS.md para sincronizar tarefas no site.`);
    }
    console.log(`  subpastas de tasks prontas: tasks/backlog/, tasks/active/, tasks/complete/`);
    console.log(`  próximos passos: preencha AGENTS.md e DESIGN.md, depois \`node ${agentsDir}/aif.mjs check\`.`);
  },

  new({ pos, opt }) {
    const intent = pos.join(' ').trim() || die('uso: aif new "<intenção>" [--type] [--size] [--prio]');
    const rows = backlogRows();
    const id = String(Math.max(0, ...rows.map((r) => +r.id)) + 1).padStart(3, '0');
    const size = (opt.size || 'M').toUpperCase();
    const prio = (opt.prio || 'P1').toUpperCase();
    const type = opt.type || 'feature';
    const status = size === 'S' ? 'todo' : 'research';
    const row = { id, type, size, prio, status, intent: intent.replaceAll('|', '/') };

    const file = getBacklogFile();
    const all = read(file).split('\n');
    const last = rows.length ? rows.at(-1).line : all.findIndex((l) => /^\|[-\s|]+\|$/.test(l));
    all.splice(last + 1, 0, fmtRow(row));
    write(file, all.join('\n'));

    const baseDir = getTasksRoot();
    const taskDir = path.join(baseDir, 'backlog', `${id}-${slug(intent)}`);
    fs.mkdirSync(taskDir, { recursive: true });

    const taskTplPath = path.join(baseDir, '_templates', 'task.md');
    if (exists(taskTplPath)) {
      const taskContent = read(taskTplPath)
        .replaceAll('<id>', id)
        .replaceAll('<título>', intent)
        .replace('status: backlog', `status: ${status}`)
        .replace('type: feature', `type: ${type}`)
        .replace('size: M', `size: ${size}`)
        .replace('prio: P1', `prio: ${prio}`)
        .replaceAll('AAAA-MM-DD', today());
      write(path.join(taskDir, 'task.md'), taskContent);
    }

    if (size !== 'S') {
      const specTplPath = path.join(baseDir, '_templates', 'spec.md');
      if (exists(specTplPath)) {
        const specContent = read(specTplPath).replace('<id> — <título>', `${id} — ${intent}`);
        write(path.join(taskDir, 'spec.md'), specContent);
      }
    }

    ok(`${id} criado → ${path.relative(ROOT, taskDir)}/`);
  },

  plan({ pos }) {
    const id = pos[0] || die('uso: aif plan <id>');
    let task = findTask(id);
    if (!task) die(`task ${id} não encontrada em tasks/ (backlog/active).`);

    if (task.category === 'backlog') {
      moveTask(task, 'active');
      ok(`${id} movido de backlog/ para active/`);
    }

    const targetDir = task.isDir ? task.path : path.dirname(task.path);
    const dest = path.join(targetDir, 'plan.md');
    if (exists(dest)) die(`${path.relative(ROOT, dest)} já existe.`);
    const tplPath = path.join(getTasksRoot(), '_templates', 'plan.md');
    const tpl = read(tplPath).replaceAll('<id>', id);
    write(dest, tpl);
    updateRow(id, (r) => ({ ...r, status: 'plan' }));
    ok(`${path.relative(ROOT, dest)} criado; status → plan`);
  },

  status({ pos }) {
    const [id, status] = pos;
    if (!id || !STATUSES.includes(status)) die(`uso: aif status <id> <${STATUSES.join('|')}>`);
    const old = updateRow(id, (r) => ({ ...r, status }));

    const task = findTask(id);
    if (task) {
      if (status === 'done' && task.category !== 'complete') {
        moveTask(task, 'complete');
      } else if (['research', 'plan', 'todo', 'doing', 'review'].includes(status) && task.category !== 'active') {
        moveTask(task, 'active');
      }
    }
    ok(`${id}: ${old.status} → ${status}`);
  },

  start({ pos, opt }) {
    const id = pos[0] || die('uso: aif start <id> [--worktree]');
    tryGit('rev-parse --git-dir') || die('não é um repositório git (rode `git init`).');
    const row = backlogRows().find((r) => r.id === id) || die(`item ${id} não está no BACKLOG.`);
    const name = branchName(row);
    if (tryGit(`rev-parse --verify --quiet refs/heads/${name}`)) die(`branch ${name} já existe.`);

    const task = findTask(id);
    if (task && task.category === 'backlog') {
      moveTask(task, 'active');
      ok(`${id} movido para tasks/active/`);
    }

    if (row.status === 'todo' || row.status === 'backlog') {
      updateRow(id, (r) => ({ ...r, status: 'doing' }));
    }

    if (opt.worktree) {
      const wt = path.join('..', `${path.basename(ROOT)}-${id}`);
      git(`worktree add "${wt}" -b ${name}`);
      ok(`worktree ${wt} na branch ${name} (rode o agente dentro dela).`);
    } else {
      git(`switch -c ${name}`);
      ok(`branch ${name} criada e ativa.`);
    }
  },

  done({ pos, opt }) {
    const id = pos[0] || die('uso: aif done <id> [--purge]');
    const row = backlogRows().find((r) => r.id === id) || die(`item ${id} não está no BACKLOG.`);
    const name = branchName(row);
    const msgs = [];

    if (tryGit('rev-parse --git-dir')) {
      const wt = (tryGit('worktree list --porcelain') || '').split('\n\n')
        .find((b) => b.includes(`branch refs/heads/${name}`));
      if (wt && tryGit(`worktree remove "${wt.split('\n')[0].slice(9)}"`) !== null) msgs.push('worktree removido');
      if (tryGit(`rev-parse --verify --quiet refs/heads/${name}`)) {
        msgs.push(tryGit(`branch -d ${name}`) !== null ? `branch ${name} apagada`
          : `branch ${name} NÃO apagada (não mergeada?)`);
      }
    }

    const task = findTask(id);
    if (task) {
      if (opt.purge) {
        fs.rmSync(task.path, { recursive: true, force: true });
        msgs.push(`${path.relative(ROOT, task.path)} apagado`);
      } else {
        moveTask(task, 'complete');
        msgs.push(`movido para tasks/complete/`);
      }
    }

    updateRow(id, (r) => ({ ...r, status: 'done' }));
    ok(`${id} concluído: ${msgs.join('; ')}`);
  },

  'import-tasks'({ pos }) {
    const srcDir = path.resolve(pos[0] || '.');
    const targetBase = getTasksRoot();
    const { copied, importedRows } = copyLocalTasks(srcDir, targetBase);
    if (copied === 0) return ok('nenhuma tarefa encontrada para importar.');
    if (importedRows.length) {
      const backlogFile = path.join(targetBase, 'BACKLOG.md');
      let currentContent = exists(backlogFile) ? read(backlogFile) : '';
      const newRows = importedRows.map(fmtRow).join('\n');
      write(backlogFile, currentContent.trimEnd() + '\n' + newRows + '\n');
    }
    ok(`${copied} tarefas importadas para ${path.relative(ROOT, targetBase)}/ e registradas no BACKLOG.md.`);
  },

  adr({ pos }) {
    const title = pos.join(' ').trim() || die('uso: aif adr "<título no imperativo>"');
    const dir = path.join(ROOT, 'docs', 'adr');
    const nums = fs.readdirSync(dir).map((f) => +(f.match(/^(\d{4})-/) || [])[1]).filter(Boolean);
    const n = String(Math.max(0, ...nums) + 1).padStart(4, '0');
    const file = `${n}-${slug(title)}.md`;
    write(path.join(dir, file), read(path.join(dir, '0000-template.md'))
      .replace('NNNN. <Título no imperativo>', `${n}. ${title}`)
      .replace('Proposto | Aceito | Substituído por NNNN', 'Proposto')
      .replace('AAAA-MM-DD', today()));
    const idx = path.join(dir, 'README.md');
    write(idx, read(idx).trimEnd() + `\n| [${n}](${file}) | ${title} | Proposto |\n`);
    ok(`docs/adr/${file} criado e indexado.`);
  },

  check() {
    const errs = [];
    const limit = (p, max) => exists(p) && lines(p) > max &&
      errs.push(`${path.relative(ROOT, p)}: ${lines(p)} linhas (máx ${max})`);
    limit(path.join(ROOT, 'AGENTS.md'), LIMITS['AGENTS.md']);
    limit(path.join(ROOT, 'DESIGN.md'), LIMITS['DESIGN.md']);
    for (const d of ['.agents', '.claude']) {
      const s = path.join(ROOT, d, 'skills');
      if (exists(s)) for (const k of fs.readdirSync(s)) limit(path.join(s, k, 'SKILL.md'), LIMITS.skill);
    }
    const adr = path.join(ROOT, 'docs', 'adr');
    if (exists(adr)) for (const f of fs.readdirSync(adr)) if (/^\d{4}-/.test(f)) limit(path.join(adr, f), LIMITS.adr);

    const backlogFile = getBacklogFile();
    if (exists(backlogFile)) {
      const rows = backlogRows();
      const ids = new Set(rows.map((r) => r.id));
      const checkFolder = (folderPath) => {
        if (!exists(folderPath)) return;
        for (const d of fs.readdirSync(folderPath)) {
          if (['active', 'actives', 'backlog', 'complete', 'completed', '_templates', 'BACKLOG.md'].includes(d)) continue;
          const m = d.match(/^(?:TASK-)?(\d{3})/i);
          if (m && !ids.has(m[1])) {
            errs.push(`${path.relative(ROOT, path.join(folderPath, d))} órfão (não está no BACKLOG).`);
          }
        }
      };
      const rootBase = getTasksRoot();
      checkFolder(rootBase);
      ['backlog', 'active', 'complete'].forEach((s) => checkFolder(path.join(rootBase, s)));
    }
    if (errs.length) { errs.forEach((e) => console.error(`✖ ${e}`)); process.exit(1); }
    ok('tudo dentro dos limites e sem itens órfãos.');
  },
};

// ---------- init helpers ----------
function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const abs = path.join(dir, e.name);
    return e.isDirectory() ? walk(abs, base) : [{ abs, rel: path.relative(base, abs) }];
  });
}

function detectCommands(dir) {
  const has = (f) => exists(path.join(dir, f));
  if (has('package.json')) {
    const s = JSON.parse(read(path.join(dir, 'package.json'))).scripts || {};
    const pm = has('pnpm-lock.yaml') ? 'pnpm' : has('yarn.lock') ? 'yarn' : has('bun.lockb') ? 'bun' : 'npm';
    const run = (k) => (pm === 'npm' && k === 'test' ? 'npm test' : `${pm} run ${k}`);
    const out = { install: `${pm} install` };
    for (const k of ['dev', 'test', 'lint']) if (s[k]) out[k] = run(k);
    return out;
  }
  if (has('pyproject.toml')) {
    const uv = has('uv.lock') ? 'uv run ' : '';
    return { install: uv ? 'uv sync' : 'pip install -e .', test: `${uv}pytest`, lint: `${uv}ruff check .` };
  }
  if (has('go.mod')) return { install: 'go mod download', dev: 'go run .', test: 'go test ./...', lint: 'go vet ./...' };
  if (has('Cargo.toml')) return { install: 'cargo build', dev: 'cargo run', test: 'cargo test', lint: 'cargo clippy' };
  return {};
}

// ---------- main ----------
const [cmd, ...rest] = process.argv.slice(2);
if (!commands[cmd]) {
  console.log(`aif — framework de fluxo para agentes

  install [--tool antigravity|claude]                instala a skill /aif-init globalmente
  detect [dir]                                       diagnóstico JSON: new | existing | initialized + backlog/mcp
  init [dir] [--tool antigravity|claude] [--force]   copia estrutura + importa tarefas locais se existirem
  new "<intenção>" [--type] [--size S|M|L] [--prio]  cria task em tasks/backlog/ e registra no BACKLOG.md
  plan <id>                                          move para tasks/active/ e cria plan.md
  status <id> <${STATUSES.join('|')}>
  start <id> [--worktree]                            move para tasks/active/ e cria branch: feat|fix|chore/<id>-<slug>
  done <id> [--purge]                                move para tasks/complete/ e limpa branch/worktree
  import-tasks [dir]                                 importa tarefas locais para tasks/{backlog,active,complete}
  adr "<título>"                                     cria e indexa próximo ADR
  check                                              valida limites de linhas e integridade das tarefas`);
  process.exit(cmd ? 1 : 0);
}
commands[cmd](parseArgs(rest));
