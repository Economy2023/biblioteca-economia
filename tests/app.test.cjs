const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// DOM mínimo para comprobar contratos de interacción, no para verificar diseño.
class Node {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.attributes = {}; this.dataset = {}; this.listeners = {}; this.className = ''; this.value = ''; this.hidden = false; this.ownText = ''; }
  set textContent(v) { this.ownText = String(v); this.children = []; }
  get textContent() { return this.ownText + this.children.map(x => x.textContent).join(''); }
  get firstChild() { return this.children[0]; }
  append(...nodes) { for (const node of nodes) { if (node.tagName === '#fragment') this.append(...node.children); else { node.parent = this; this.children.push(node); } } }
  prepend(...nodes) { for (const node of nodes.reverse()) { node.parent = this; this.children.unshift(node); } }
  replaceChildren(...nodes) { this.children = []; this.ownText = ''; this.append(...nodes); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(k, v) { (this.listeners[k] ||= []).push(v); }
  dispatch(k, event = {}) { for (const fn of this.listeners[k] || []) fn(event); }
  querySelectorAll(selector) { const all = this.children.flatMap(n => [n, ...n.querySelectorAll('*')]); return selector === '*' ? all : all.filter(n => selector.startsWith('.') ? n.className.split(' ').includes(selector.slice(1)) : n.tagName === selector); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  get classList() { return { toggle: (name, enabled) => { const set = new Set(this.className.split(' ').filter(Boolean)); const on = enabled === undefined ? !set.has(name) : enabled; on ? set.add(name) : set.delete(name); this.className = [...set].join(' '); }, contains: name => this.className.split(' ').includes(name) }; }
  scrollIntoView() { this.scrolled = true; }
  getBoundingClientRect() { return { top: 9999 }; }
  focus() { this.focused = true; }
}
function setup() {
  const doc = new Node('document'); doc.head = new Node('head');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const ids = Object.fromEntries([...html.matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"/g)].map(m => [m[2], new Node(m[1])]));
  for (const [id, node] of Object.entries(ids)) { node.id = id; doc.append(node); }
  doc.append(doc.head);
  doc.getElementById = id => ids[id] || null;
  doc.createElement = tag => new Node(tag);
  doc.createElementNS = (_, tag) => new Node(tag);
  doc.createDocumentFragment = () => new Node('#fragment');
  const top = new Node('a'); top.className = 'to-top'; doc.append(top);
  const use = new Node('use'); ids.menuToggle.append(use); ids.menuToggle.setAttribute('aria-expanded', 'false');
  for (const id of ['inicio','cursos','trabajos','aporta']) { const a = new Node('a'); a.setAttribute('href', `#${id}`); ids.mainNav.append(a); }
  ids.contributeLink.append(new Node('#text'));
  const timers = new Map(); let timerId = 0;
  const ctx = { document: doc, URL, URLSearchParams, location: { search: '' }, matchMedia: () => ({ matches: true }), setTimeout: (fn, delay) => { const id = ++timerId; timers.set(id, {fn,delay}); return id; }, clearTimeout: id => timers.delete(id), requestAnimationFrame: fn => fn(), addEventListener() {}, scrollY: 0 };
  ctx.window = ctx; vm.createContext(ctx);
  for (const file of ['config.js', 'data.js', 'app.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), ctx);
  const feed = rows => {
    const script = doc.head.children.find(n => n.src?.includes('/gviz/tq'));
    const handler = new URL(script.src).searchParams.get('tqx').split('responseHandler:')[1];
    ctx[handler]({ status: 'ok', table: { rows: rows.map(row => ({ c: row.map(v => ({ v })) })) } });
  };
  const tick = delay => { for (const [id, timer] of [...timers]) if (timer.delay === delay) { timers.delete(id); timer.fn(); } };
  return { ctx, doc, ids, timers, feed, tick };
}
const rows = [
  ['a', 'Introducción a la Economía', 1, 'Principios', 'publico', 'https://drive.google.com/a', 'Sí', 1],
  ['b', 'Econometría', 7, 'Análisis de datos', 'restringido', 'https://drive.google.com/b', 'Sí', 1],
  ['c', '<img src=x onerror=alert(1)>', 1, 'Texto de prueba', 'publico', 'javascript:alert(1)', 'Sí', 2]
];
test('Carga real: renderiza selección, accesos y texto sin ejecutar HTML de la hoja', () => {
  const { ids, feed } = setup();
  assert.equal(ids.coursesGrid.getAttribute('aria-busy'), 'true');
  feed(rows);
  assert.equal(ids.coursesGrid.getAttribute('aria-busy'), 'false');
  assert.equal(ids.coursesGrid.children.length, 2);
  assert.equal(ids.coursesGrid.querySelectorAll('a').length, 1);
  assert.equal(ids.coursesGrid.querySelectorAll('img').length, 0);
  assert.match(ids.coursesGrid.textContent, /<img src=x onerror/);
  const link = ids.coursesGrid.querySelector('a');
  assert.equal(link.rel, 'noopener noreferrer');
  assert.equal(link.target, '_blank');
  assert.match(ids.coursesGrid.textContent, /Materiales próximamente/);
});
test('Buscar no desplaza mientras se escribe; enviar sí, y ver todos elimina filtros', () => {
  const { ids, feed, tick } = setup(); feed(rows);
  ids.buscador.value = 'ECONOMETRIA'; ids.buscador.dispatch('input'); tick(180);
  assert.equal(ids.coursesGrid.children.length, 1);
  assert.match(ids.coursesGrid.textContent, /Econometría/);
  assert.equal(ids.cursos.scrolled, undefined);
  let prevented = false;
  ids.searchForm.dispatch('submit', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(ids.cursos.scrolled, true);
  ids.showAll.dispatch('click');
  assert.equal(ids.buscador.value, ''); assert.equal(ids.coursesGrid.children.length, 3);
});
test('Selección por semestre, resultado vacío y recuperación', () => {
  const { ids, feed, tick } = setup(); feed(rows);
  const seventh = ids.semesterScroll.children.find(n => n.dataset.semester === 7);
  seventh.dispatch('click'); assert.equal(seventh.getAttribute('aria-pressed'), 'true');
  assert.equal(ids.coursesGrid.children.length, 1); assert.match(ids.coursesGrid.textContent, /Econometría/);
  ids.buscador.value = 'noexiste'; ids.buscador.dispatch('input'); tick(180);
  assert.match(ids.coursesGrid.textContent, /No encontramos ese curso/);
  ids.coursesGrid.querySelector('button').dispatch('click');
  assert.equal(ids.coursesGrid.children.length, 3);
});
test('Fallo y reintento: no bloquea la página ni sustituye datos reales por ejemplos', () => {
  const { ids, doc, feed } = setup();
  doc.head.children.find(n => n.src?.includes('/gviz/tq')).onerror();
  assert.match(ids.coursesGrid.textContent, /No pudimos cargar/);
  assert.equal(ids.coursesGrid.getAttribute('aria-busy'), 'false');
  ids.coursesGrid.querySelector('button').dispatch('click');
  assert.equal(ids.coursesGrid.getAttribute('aria-busy'), 'true');
  feed(rows); assert.equal(ids.coursesGrid.children.length, 2);
});
test('Tiempo de espera y menú móvil: aviso recuperable y cierre por Escape', () => {
  const { ids, doc, tick } = setup(); tick(15000);
  assert.match(ids.coursesGrid.textContent, /No pudimos cargar/);
  ids.menuToggle.dispatch('click'); assert.equal(ids.menuToggle.getAttribute('aria-expanded'), 'true');
  doc.dispatch('keydown', { key: 'Escape' });
  assert.equal(ids.menuToggle.getAttribute('aria-expanded'), 'false'); assert.equal(ids.menuToggle.focused, true);
});
