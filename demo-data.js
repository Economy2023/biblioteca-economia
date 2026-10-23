/* Solo se carga al abrir index.html?demo=1. Estos no son datos del plan real. */
window.BIBLIOTECA_DEMO = [
  ["Microeconomía", 3, "Decisiones, mercados y comportamiento de los agentes económicos."],
  ["Macroeconomía", 4, "Crecimiento, inflación y políticas económicas."],
  ["Econometría", 7, "Datos y modelos para analizar la economía."],
  ["Matemática", 1, "Herramientas matemáticas para el razonamiento económico."],
  ["Estadística", 2, "Análisis e interpretación de información."],
  ["Introducción a la Economía", 1, "Conceptos y preguntas fundamentales de la disciplina."],
  ["Comunicación Académica", 1, "Lectura y escritura para la vida universitaria."],
  ["Realidad Nacional", 1, "Una mirada a nuestro entorno y su desarrollo."],
  ["Métodos de Estudio", 1, "Herramientas para organizar tu aprendizaje."],
  ["Economía Internacional", 6, "Comercio, integración y mercados globales."],
  ["Economía del Perú", 5, "Estructura, evolución y desafíos de la economía peruana."],
  ["Finanzas Públicas", 8, "Recursos públicos y decisiones de política económica."],
  ["Investigación Económica", 9, "Preguntas, métodos y proyectos de investigación."],
  ["Seminario de Tesis", 10, "Desarrollo y comunicación de una investigación."]
].map(([nombre, ciclo, descripcion], index) => ({ id: `demo-${index}`, nombre, ciclo, descripcion, tipoAcceso: index % 3 ? "publico" : "restringido", driveUrl: "", activo: true, orden: index }));
