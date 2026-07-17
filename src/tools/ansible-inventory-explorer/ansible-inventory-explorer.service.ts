import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export interface InventoryModel {
  // group name -> definition; hosts/vars maps, children list
  groups: Record<string, { hosts: string[]; children: string[]; vars: Record<string, unknown> }>
  hostVars: Record<string, Record<string, unknown>>
}

function ensureGroup(model: InventoryModel, name: string) {
  if (!model.groups[name]) {
    model.groups[name] = { hosts: [], children: [], vars: {} };
  }
  return model.groups[name];
}

function coerce(value: string): unknown {
  if (value === 'true' || value === 'True') { return true; }
  if (value === 'false' || value === 'False') { return false; }
  if (/^-?\d+$/.test(value)) { return Number.parseInt(value, 10); }
  if (/^-?\d+\.\d+$/.test(value)) { return Number.parseFloat(value); }
  return value.replace(/^["']|["']$/g, '');
}

export function parseIniInventory(text: string): InventoryModel {
  const model: InventoryModel = { groups: {}, hostVars: {} };
  let section = 'ungrouped';
  let mode: 'hosts' | 'children' | 'vars' = 'hosts';
  ensureGroup(model, 'ungrouped');

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/[#;].*$/, '').trim();
    if (!line) { continue; }

    const header = line.match(/^\[([^\]:]+)(?::(children|vars))?\]$/);
    if (header) {
      section = header[1];
      mode = (header[2] as 'children' | 'vars') ?? 'hosts';
      ensureGroup(model, section);
      continue;
    }

    if (mode === 'children') {
      ensureGroup(model, line);
      ensureGroup(model, section).children.push(line);
    }
    else if (mode === 'vars') {
      const eq = line.indexOf('=');
      if (eq > 0) {
        ensureGroup(model, section).vars[line.slice(0, eq).trim()] = coerce(line.slice(eq + 1).trim());
      }
    }
    else {
      // host line: name key=value key=value…
      const [host, ...pairs] = line.split(/\s+/);
      ensureGroup(model, section).hosts.push(host);
      if (!model.hostVars[host]) { model.hostVars[host] = {}; }
      for (const pair of pairs) {
        const eq = pair.indexOf('=');
        if (eq > 0) {
          model.hostVars[host][pair.slice(0, eq)] = coerce(pair.slice(eq + 1));
        }
      }
    }
  }
  return model;
}

type YamlGroupNode = {
  hosts?: Record<string, Record<string, unknown> | null>
  children?: Record<string, YamlGroupNode | null>
  vars?: Record<string, unknown>
};

export function parseYamlInventory(text: string): InventoryModel {
  const model: InventoryModel = { groups: {}, hostVars: {} };
  const doc = parseYaml(text, { merge: true }) as Record<string, YamlGroupNode | null> | null;
  if (!doc || typeof doc !== 'object') {
    return model;
  }

  function walk(name: string, node: YamlGroupNode | null) {
    const group = ensureGroup(model, name);
    if (!node) { return; }
    if (node.vars) { Object.assign(group.vars, node.vars); }
    for (const [host, vars] of Object.entries(node.hosts ?? {})) {
      group.hosts.push(host);
      model.hostVars[host] = { ...(model.hostVars[host] ?? {}), ...(vars ?? {}) };
    }
    for (const [child, childNode] of Object.entries(node.children ?? {})) {
      group.children.push(child);
      walk(child, childNode);
    }
  }

  for (const [name, node] of Object.entries(doc)) {
    walk(name, node);
  }
  return model;
}

export function detectFormat(text: string): 'ini' | 'yaml' {
  const trimmed = text.trim();
  if (/^\[[^\]]+\]/m.test(trimmed) && !/^\s*\w+\s*:/m.test(trimmed.split('\n')[0])) {
    return 'ini';
  }
  return 'yaml';
}

export function parseInventory(text: string): InventoryModel {
  return detectFormat(text) === 'ini' ? parseIniInventory(text) : parseYamlInventory(text);
}

export function toYamlInventory(model: InventoryModel): string {
  const topLevel = new Set(Object.keys(model.groups));
  for (const g of Object.values(model.groups)) {
    for (const child of g.children) { topLevel.delete(child); }
  }

  function buildNode(name: string, seen: Set<string>): YamlGroupNode {
    const group = model.groups[name];
    const node: YamlGroupNode = {};
    if (group.hosts.length) {
      node.hosts = Object.fromEntries(group.hosts.map(h => [
        h,
        Object.keys(model.hostVars[h] ?? {}).length ? model.hostVars[h] : null,
      ]));
    }
    if (Object.keys(group.vars).length) { node.vars = group.vars; }
    if (group.children.length) {
      node.children = {};
      for (const child of group.children) {
        // guard against cycles
        node.children[child] = seen.has(child) ? null : buildNode(child, new Set([...seen, child]));
      }
    }
    return node;
  }

  const doc: Record<string, YamlGroupNode> = {};
  for (const name of topLevel) {
    if (name === 'ungrouped' && !model.groups.ungrouped.hosts.length) { continue; }
    doc[name] = buildNode(name, new Set([name]));
  }
  return stringifyYaml(doc, { indent: 2 });
}

export function toIniInventory(model: InventoryModel): string {
  const lines: string[] = [];
  const fmtVars = (vars: Record<string, unknown>) =>
    Object.entries(vars).map(([k, v]) => `${k}=${typeof v === 'string' && v.includes(' ') ? `"${v}"` : v}`).join(' ');

  for (const [name, group] of Object.entries(model.groups)) {
    if (name === 'all') { continue; }
    if (group.hosts.length || (!group.children.length && !Object.keys(group.vars).length)) {
      lines.push(`[${name}]`);
      for (const h of group.hosts) {
        const vars = model.hostVars[h] ?? {};
        lines.push(Object.keys(vars).length ? `${h} ${fmtVars(vars)}` : h);
      }
      lines.push('');
    }
    if (group.children.length) {
      lines.push(`[${name}:children]`, ...group.children, '');
    }
    if (Object.keys(group.vars).length) {
      lines.push(`[${name}:vars]`);
      for (const [k, v] of Object.entries(group.vars)) { lines.push(`${k}=${v}`); }
      lines.push('');
    }
  }
  return lines.join('\n').trim();
}

export function resolveGroupHosts(model: InventoryModel, name: string, seen = new Set<string>()): string[] {
  if (name === 'all') { return allHosts(model); }
  const group = model.groups[name];
  if (!group || seen.has(name)) { return []; }
  seen.add(name);
  const hosts = [...group.hosts];
  for (const child of group.children) {
    hosts.push(...resolveGroupHosts(model, child, seen));
  }
  return [...new Set(hosts)];
}

export function allHosts(model: InventoryModel): string[] {
  return [...new Set(Object.values(model.groups).flatMap(g => g.hosts))];
}

export function renderGroupTree(model: InventoryModel): string {
  const childSet = new Set(Object.values(model.groups).flatMap(g => g.children));
  const roots = Object.keys(model.groups).filter(g => !childSet.has(g) && g !== 'all');
  const lines: string[] = ['@all'];

  function render(name: string, prefix: string, isLast: boolean, seen: Set<string>) {
    const group = model.groups[name];
    const total = resolveGroupHosts(model, name).length;
    lines.push(`${prefix}${isLast ? '└── ' : '├── '}@${name} (${total} host${total === 1 ? '' : 's'})`);
    if (!group || seen.has(name)) { return; }
    seen.add(name);
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    const entries: Array<{ label: string; group?: string }> = [
      ...group.children.map(c => ({ label: c, group: c })),
      ...group.hosts.map(h => ({ label: h })),
    ];
    entries.forEach((entry, i) => {
      const last = i === entries.length - 1;
      if (entry.group) {
        render(entry.group, childPrefix, last, seen);
      }
      else {
        lines.push(`${childPrefix}${last ? '└── ' : '├── '}${entry.label}`);
      }
    });
  }

  roots.forEach((root, i) => render(root, '', i === roots.length - 1, new Set()));
  return lines.join('\n');
}

// Ansible host pattern: colon-separated terms; ':&' intersect, ':!' exclude,
// plain term = union. Terms may be group names, host names, or fnmatch globs.
export function matchPattern(model: InventoryModel, pattern: string): string[] {
  const universe = allHosts(model);
  if (!pattern.trim()) { return []; }

  function termHosts(term: string): string[] {
    if (term === 'all' || term === '*') { return universe; }
    if (model.groups[term]) { return resolveGroupHosts(model, term); }
    if (/[*?[\]]/.test(term)) {
      const re = new RegExp(`^${term.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
      const globHosts = universe.filter(h => re.test(h));
      const globGroups = Object.keys(model.groups).filter(g => re.test(g));
      return [...new Set([...globHosts, ...globGroups.flatMap(g => resolveGroupHosts(model, g))])];
    }
    return universe.includes(term) ? [term] : [];
  }

  let result: string[] | null = null;
  // split on ':' or ',' but keep '&'/'!' prefixes
  for (const raw of pattern.split(/[:,]/).map(s => s.trim()).filter(Boolean)) {
    if (raw.startsWith('&')) {
      const hosts = new Set(termHosts(raw.slice(1)));
      result = (result ?? universe).filter(h => hosts.has(h));
    }
    else if (raw.startsWith('!')) {
      const hosts = new Set(termHosts(raw.slice(1)));
      result = (result ?? universe).filter(h => !hosts.has(h));
    }
    else {
      result = [...new Set([...(result ?? []), ...termHosts(raw)])];
    }
  }
  return result ?? [];
}
