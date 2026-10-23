/* Transformación de los datos públicos de Google Sheets, sin dependencias. */
(function (root) {
  "use strict";
  function normalize(value) {
    return String(value ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function safeUrl(value) {
    try {
      const url = new URL(String(value ?? "").trim());
      return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
    } catch { return ""; }
  }
  function parseSheet(payload) {
    if (payload?.status === "error" || !Array.isArray(payload?.table?.rows)) {
      throw new Error("No se pudo leer la hoja de cursos.");
    }
    return payload.table.rows.map((row) => {
      const cells = row?.c || [];
      const value = (index) => cells[index]?.v ?? "";
      return {
        id: String(value(0)), nombre: String(value(1)).trim(),
        ciclo: Number(value(2)), descripcion: String(value(3)).trim(),
        tipoAcceso: String(value(4)), driveUrl: safeUrl(value(5)),
        activo: ["si", "true", "1"].includes(normalize(value(6))),
        orden: Number.isFinite(Number(value(7))) ? Number(value(7)) : 0
      };
    }).filter((course) => course.activo && course.nombre && Number.isInteger(course.ciclo) && course.ciclo >= 1 && course.ciclo <= 10)
      .sort((a, b) => a.ciclo - b.ciclo || a.orden - b.orden);
  }
  function filterCourses(courses, semester, query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    // La búsqueda cubre todos los semestres, como en el repositorio original.
    if (words.length) return courses.filter((course) => {
      const text = normalize(`${course.nombre} ${course.descripcion}`);
      return words.every((word) => text.includes(word));
    });
    return semester === null ? courses.slice() : courses.filter((course) => course.ciclo === semester);
  }
  const api = Object.freeze({ normalize, safeUrl, parseSheet, filterCourses });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BibliotecaData = api;
})(typeof window !== "undefined" ? window : globalThis);
