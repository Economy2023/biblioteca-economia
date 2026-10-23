const test = require('node:test');
const assert = require('node:assert/strict');
const { normalize, safeUrl, parseSheet, filterCourses } = require('../data.js');
function response(rows) { return { status: 'ok', table: { rows: rows.map(row => ({ c: row.map(v => v === null ? null : { v }) })) } }; }
test('Sheets: conserva activos, respeta columnas, ordena y omite semestres inválidos', () => {
  const rows = [
    ['b', 'Econometría', 7, 'Modelos', 'restringido', 'https://drive.google.com/b', 'Sí', 1],
    ['c', 'No activo', 1, '', '', '', 'No', 1],
    ['d', 'Fuera del plan', 11, '', '', '', 'Si', 0],
    ['a', 'Álgebra', 1, null, 'publico', 'https://drive.google.com/a', 'SI', 2],
    ['e', 'Cálculo', 1, '', '', '', 'si', 1],
    ['f', '', 2, '', '', '', 'si', 1],
    ['g', 'Fracción', 2.5, '', '', '', 'si', 1]
  ];
  const courses = parseSheet(response(rows));
  assert.deepEqual(courses.map(c => c.nombre), ['Cálculo', 'Álgebra', 'Econometría']);
  assert.equal(courses[1].descripcion, '');
  assert.equal(courses[2].tipoAcceso, 'restringido');
  assert.equal(courses[2].driveUrl, 'https://drive.google.com/b');
});
test('Sheets: distingue respuesta vacía válida de respuesta de error o rota', () => {
  assert.deepEqual(parseSheet(response([])), []);
  assert.throws(() => parseSheet({ status: 'error', errors: [] }));
  assert.throws(() => parseSheet({ table: {} }));
  assert.throws(() => parseSheet(null));
});
test('Búsqueda: ignora tildes y mayúsculas, cubre todos los semestres y cruza nombre/descripcion', () => {
  const courses = [{ nombre: 'Econometría', descripcion: 'Análisis de datos', ciclo: 7 }, { nombre: 'Matemática', descripcion: 'Álgebra', ciclo: 1 }];
  assert.equal(normalize('  ECONOMÍA  '), 'economia');
  assert.deepEqual(filterCourses(courses, 1, 'ECONOMETRIA datos'), [courses[0]]);
  assert.deepEqual(filterCourses(courses, 1, ''), [courses[1]]);
  assert.deepEqual(filterCourses(courses, null, '  '), courses);
  assert.deepEqual(filterCourses(courses, null, 'inexistente'), []);
});
test('Enlaces: bloquea scripts, http, datos y credenciales, admite enlaces HTTPS válidos', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'http://example.com', '', '#', 'https://user:password@example.com']) assert.equal(safeUrl(url), '');
  assert.equal(safeUrl(' https://drive.google.com/drive/folders/abc?usp=sharing '), 'https://drive.google.com/drive/folders/abc?usp=sharing');
});
