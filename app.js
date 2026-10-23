(() => {
  "use strict";
  const config = window.BIBLIOTECA_CONFIG;
  const { normalize, safeUrl, parseSheet, filterCourses } = window.BibliotecaData;
  const $ = (id) => document.getElementById(id);
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const params = new URLSearchParams(location.search);
  const isDemo = params.get("demo") === "1";
  const state = { courses: [], semester: 1, query: params.get("q") || "", status: "loading" };
  const grid = $("coursesGrid");
  const search = $("buscador");
  let inputTimer;
  let refreshTimer;
  let requestPending = false;
  let requestId = 0;
  const refreshInterval = Math.max(30000, Number(config.refreshIntervalMs) || 60000);
  search.value = state.query;
  if (state.query || isDemo) state.semester = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function icon(name, className = "icon") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#i-${name}`);
    svg.append(use);
    return svg;
  }
  function scrollToCourses() {
    $("cursos").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }
  function makeSemesterButtons() {
    const fragment = document.createDocumentFragment();
    for (const semester of [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const label = semester === null ? "Todos" : roman[semester];
      const button = element("button", `semester-tab${semester === null ? " is-all" : ""}`, label);
      button.type = "button";
      button.dataset.semester = semester === null ? "all" : semester;
      button.setAttribute("aria-label", semester === null ? "Ver todos los semestres" : `Semestre ${roman[semester]}`);
      button.setAttribute("aria-pressed", String(state.semester === semester));
      button.setAttribute("aria-controls", "coursesGrid");
      button.addEventListener("click", () => {
        clearTimeout(inputTimer);
        state.semester = semester;
        state.query = "";
        search.value = "";
        render();
      });
      fragment.append(button);
    }
    $("semesterScroll").replaceChildren(fragment);
  }
  function updateSelection() {
    document.querySelectorAll(".semester-tab").forEach((button) => {
      const semester = button.dataset.semester === "all" ? null : Number(button.dataset.semester);
      button.setAttribute("aria-pressed", String(!state.query && semester === state.semester));
    });
  }
  function courseIcon(name) {
    const n = normalize(name);
    if (/econometr|estadistic|dato/.test(n)) return "data";
    if (/macro|crecimiento|finanza/.test(n)) return "trend";
    if (/micro|econom/.test(n)) return "chart";
    return "book";
  }
  function courseCard(course, index, count) {
    const featured = index % 5 === 0;
    const card = element("article", `course-card${featured ? " featured" : ""}`);
    const titleId = `course-title-${index}`;
    card.setAttribute("aria-labelledby", titleId);
    card.append(icon(courseIcon(course.nombre), "icon course-icon"));
    card.append(element("span", "course-semester", `Semestre ${roman[course.ciclo]}`));
    const title = element("h3", "", course.nombre);
    title.id = titleId;
    card.append(title, element("p", "course-description", course.descripcion || "Consulta los materiales académicos disponibles para este curso."));
    if (featured && count >= 5) {
      const resources = element("div", "resource-labels");
      // Descriptores del repositorio; no inventan enlaces ni cantidades por tipo.
      ["Sílabos", "Guías", "Bibliografía"].forEach((label) => {
        const item = element("span", "", label);
        item.prepend(icon(label === "Bibliografía" ? "book" : "file"));
        resources.append(item);
      });
      card.append(resources);
    }
    const bottom = element("div", "course-bottom");
    const restricted = normalize(course.tipoAcceso) === "restringido";
    const access = element("span", "course-access", restricted ? "Acceso restringido" : "Acceso público");
    if (restricted) access.prepend(icon("lock"));
    bottom.append(access);
    const url = safeUrl(course.driveUrl);
    if (url && !isDemo) {
      const link = element("a", "course-link");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Abrir ${course.nombre} en Google Drive, nueva pestaña`);
      link.append(element("span", "course-link-label", "Abrir en Drive"), icon("external"));
      bottom.append(link);
    } else {
      bottom.append(element("span", "course-unavailable", isDemo ? "Curso de ejemplo" : "Materiales próximamente"));
    }
    card.append(bottom);
    return card;
  }
  function renderState(title, description, action) {
    grid.className = "courses-grid";
    delete grid.dataset.count;
    const panel = element("div", "state-panel");
    panel.append(state.status === "loading" ? element("span", "loading-dot") : icon(state.status === "error" ? "book" : "search", "icon empty-icon"));
    panel.append(element("h3", "", title), element("p", "", description));
    if (action) {
      const button = element("button", "button button-blue", action.label);
      button.type = "button";
      button.addEventListener("click", action.run);
      panel.append(button);
    }
    grid.replaceChildren(panel);
    $("resultsStatus").textContent = `${title}. ${description}`;
  }
  function render() {
    updateSelection();
    grid.setAttribute("aria-busy", String(state.status === "loading"));
    if (state.status === "loading") {
      renderState("Cargando tus cursos", "Estamos preparando la biblioteca.");
      return;
    }
    if (state.status === "error") {
      renderState("No pudimos cargar los cursos", "Comprueba tu conexión e inténtalo otra vez. Puedes seguir explorando las demás secciones de la biblioteca.", { label: "Volver a intentar", run: loadCourses });
      return;
    }
    const results = filterCourses(state.courses, state.semester, state.query);
    const searching = Boolean(normalize(state.query));
    $("coursesEyebrow").textContent = searching ? "Búsqueda en todos los semestres" : state.semester === null ? "Biblioteca académica" : `Plan de estudios · ${roman[state.semester]} semestre`;
    $("coursesTitle").textContent = searching ? "Resultados de tu búsqueda" : "Explora tus cursos";
    const context = searching ? `para «${state.query.trim()}»` : state.semester === null ? "en la biblioteca" : `en el ${roman[state.semester]} semestre`;
    const description = `${results.length} ${results.length === 1 ? "curso disponible" : "cursos disponibles"} ${context}.`;
    $("coursesDescription").textContent = description;
    $("resultsStatus").textContent = description;
    if (!results.length) {
      if (searching) renderState("No encontramos ese curso", "Prueba con otro nombre o una palabra más corta.", { label: "Ver todos los cursos", run: showAll });
      else renderState("Este semestre está por crecer", "Todavía no hay cursos publicados para esta selección. Puedes consultar los demás semestres.", { label: "Ver todos los cursos", run: showAll });
      return;
    }
    grid.className = `courses-grid${results.length < 5 ? " is-compact" : ""}`;
    grid.dataset.count = results.length;
    const fragment = document.createDocumentFragment();
    results.forEach((course, index) => fragment.append(courseCard(course, index, results.length)));
    grid.replaceChildren(fragment);
  }
  function showAll() {
    clearTimeout(inputTimer);
    state.semester = null;
    state.query = "";
    search.value = "";
    render();
  }
  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    if (!isDemo && document.visibilityState !== "hidden") {
      refreshTimer = setTimeout(loadCourses, refreshInterval);
    }
  }
  function loadCourses() {
    if (requestPending) return;
    clearTimeout(refreshTimer);
    const hadData = state.status === "ready";
    if (!hadData) {
      state.status = "loading";
      render();
    }
    if (isDemo) {
      $("demoBanner").hidden = false;
      const script = document.createElement("script");
      script.src = "demo-data.js";
      script.onload = () => { state.courses = window.BIBLIOTECA_DEMO; state.status = "ready"; render(); script.remove(); };
      script.onerror = () => { state.status = "error"; render(); script.remove(); };
      document.head.append(script);
      return;
    }
    const id = ++requestId;
    const callback = `__bibliotecaSheetResponse${id}`;
    const script = document.createElement("script");
    requestPending = true;
    let finished = false;
    const cleanup = () => {
      clearTimeout(timeout);
      script.remove();
      delete window[callback];
      requestPending = false;
    };
    const fail = () => {
      if (finished) return;
      finished = true;
      cleanup();
      if (!hadData) {
        state.status = "error";
        render();
      } else {
        $("resultsStatus").textContent = "No pudimos actualizar los cursos. Seguimos mostrando los últimos disponibles y volveremos a intentarlo.";
      }
      scheduleRefresh();
    };
    const timeout = setTimeout(fail, 15000);
    window[callback] = (payload) => {
      if (finished || id !== requestId) return;
      let courses;
      try { courses = parseSheet(payload); }
      catch { fail(); return; }
      const changed = JSON.stringify(courses) !== JSON.stringify(state.courses);
      state.courses = courses;
      state.status = "ready";
      finished = true;
      cleanup();
      // Sin cambios, conservamos las tarjetas y el foco del teclado.
      if (!hadData || changed) render();
      else $("resultsStatus").textContent = $("coursesDescription").textContent;
      scheduleRefresh();
    };
    const url = new URL(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(config.sheetId)}/gviz/tq`);
    url.searchParams.set("sheet", config.sheetName);
    url.searchParams.set("headers", "1");
    url.searchParams.set("tqx", `out:json;responseHandler:${callback}`);
    url.searchParams.set("_", String(Date.now()));
    script.src = url.href;
    script.async = true;
    script.onerror = fail;
    script.onload = () => { if (!finished) fail(); };
    document.head.append(script);
  }

  $("searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    clearTimeout(inputTimer);
    state.query = search.value;
    render();
    scrollToCourses();
  });
  search.addEventListener("input", () => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => { state.query = search.value; render(); }, 180);
  });
  $("showAll").addEventListener("click", showAll);
  document.addEventListener("visibilitychange", () => {
    if (isDemo) return;
    if (document.visibilityState === "hidden") clearTimeout(refreshTimer);
    else loadCourses();
  });

  // Navegación móvil sin dependencias ni bloqueo del desplazamiento.
  const menu = $("menuToggle");
  const nav = $("mainNav");
  function setMenu(open) {
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    nav.classList.toggle("is-open", open);
  }
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") { setMenu(false); menu.focus(); } });

  const worksUrl = safeUrl(config.trabajosUrl);
  if (worksUrl) $("worksDriveLink").href = worksUrl;
  else $("worksDriveLink").hidden = true;
  const contributionUrl = safeUrl(config.aporteUrl);
  const email = String(config.aporteEmail || "").trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/[\r\n]/.test(email);
  if (contributionUrl || emailValid) {
    const link = $("contributeLink");
    link.href = contributionUrl || `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Aporte a la Biblioteca de Economía")}`;
    link.firstChild.textContent = "Enviar material";
    if (contributionUrl) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
    $("contributeNote").textContent = "El Centro Federado revisa cada aporte antes de publicarlo.";
  }
  $("footerYear").textContent = `© ${new Date().getFullYear()}`;
  const toTop = document.querySelector(".to-top");
  let scrollPending = false;
  function updateScroll() {
    toTop.hidden = window.scrollY < 650;
    let current = "#inicio";
    ["cursos", "trabajos", "aporta"].forEach((id) => {
      if ($(id).getBoundingClientRect().top <= 150) current = `#${id}`;
    });
    nav.querySelectorAll("a").forEach((link) => {
      if (link.getAttribute("href") === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    scrollPending = false;
  }
  window.addEventListener("scroll", () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  makeSemesterButtons();
  loadCourses();
})();
