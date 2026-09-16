/* =====================================================
   CONFIGURACIÓN
===================================================== */

const SHEET_ID = "12NOm3qbdM7X0eA6NPCafV35p6rhENyCcanIs47ndLuw";

const SHEET_NAME = "Secciones";


/* =====================================================
   DATOS
===================================================== */

let secciones = [];


/* =====================================================
   DOM
===================================================== */

const buscador =
    document.getElementById("buscador");

const filtroCiclo =
    document.getElementById("filtroCiclo");

const filtroAcceso =
    document.getElementById("filtroAcceso");

const limpiarFiltros =
    document.getElementById("limpiarFiltros");

const mostrarTodos =
    document.getElementById("mostrarTodos");

const contador =
    document.getElementById("contador");

const contenedor =
    document.getElementById("secciones");

const listaCiclos =
    document.getElementById("listaCiclos");

const menuButton =
    document.getElementById("menuButton");

const mainNav =
    document.getElementById("mainNav");


/* =====================================================
   ESTADÍSTICAS
===================================================== */

const statRecursos =
    document.getElementById("statRecursos");

const statCiclos =
    document.getElementById("statCiclos");

const statPublicos =
    document.getElementById("statPublicos");

const statRestringidos =
    document.getElementById("statRestringidos");


/* =====================================================
   FOOTER
===================================================== */

document.getElementById(
    "anioActual"
).textContent =
    `© ${new Date().getFullYear()}`;


/* =====================================================
   GOOGLE SHEETS
===================================================== */

google.charts.load("current");

google.charts.setOnLoadCallback(
    cargarSecciones
);


function cargarSecciones() {

    mostrarCarga();

    const url =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`
        +
        `?sheet=${encodeURIComponent(SHEET_NAME)}`
        +
        `&headers=1`;

    const query =
        new google.visualization.Query(url);

    query.send(
        procesarRespuesta
    );

}


/* =====================================================
   PROCESAR DATOS
===================================================== */

function procesarRespuesta(response) {

    if (response.isError()) {

        console.error(
            response.getMessage()
        );

        mostrarError(
            "No fue posible cargar el catálogo."
        );

        return;

    }

    const data =
        response.getDataTable();

    secciones = [];


    for (
        let fila = 0;
        fila < data.getNumberOfRows();
        fila++
    ) {

        const seccion = {

            id:
                obtenerValor(
                    data,
                    fila,
                    0
                ),

            nombre:
                obtenerValor(
                    data,
                    fila,
                    1
                ),

            ciclo:
                obtenerValor(
                    data,
                    fila,
                    2
                ),

            descripcion:
                obtenerValor(
                    data,
                    fila,
                    3
                ),

            tipoAcceso:
                obtenerValor(
                    data,
                    fila,
                    4
                ),

            driveUrl:
                obtenerValor(
                    data,
                    fila,
                    5
                ),

            activo:
                obtenerValor(
                    data,
                    fila,
                    6
                ),

            orden:
                obtenerValor(
                    data,
                    fila,
                    7
                )

        };


        if (
            normalizarTexto(
                seccion.activo
            ) === "si"
        ) {

            secciones.push(
                seccion
            );

        }

    }


    ordenarSecciones();

    generarFiltroCiclos();

    generarTarjetasCiclos();

    actualizarEstadisticas();

    aplicarFiltros();

}


/* =====================================================
   UTILIDADES
===================================================== */

function obtenerValor(
    data,
    fila,
    columna
) {

    const valor =
        data.getValue(
            fila,
            columna
        );

    return valor ?? "";

}


function normalizarTexto(valor) {

    return String(
        valor || ""
    )

        .trim()

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


function convertirRomano(ciclo) {

    const romanos = {

        1: "I",
        2: "II",
        3: "III",
        4: "IV",
        5: "V",
        6: "VI",
        7: "VII",
        8: "VIII",
        9: "IX",
        10: "X"

    };

    const numero =
        Number(ciclo);

    return (
        romanos[numero]
        ||
        ciclo
    );

}


/* =====================================================
   ORDEN
===================================================== */

function ordenarSecciones() {

    secciones.sort(
        (a, b) => {

            const cicloA =
                Number(a.ciclo) || 0;

            const cicloB =
                Number(b.ciclo) || 0;


            if (
                cicloA !== cicloB
            ) {

                return cicloA - cicloB;

            }


            return (
                Number(a.orden || 0)
                -
                Number(b.orden || 0)
            );

        }
    );

}


/* =====================================================
   ESTADÍSTICAS
===================================================== */

function actualizarEstadisticas() {

    const ciclos =
        new Set(
            secciones.map(
                s => String(s.ciclo)
            )
        );


    const publicos =
        secciones.filter(
            s =>
                normalizarTexto(
                    s.tipoAcceso
                ) === "publico"
        ).length;


    const restringidos =
        secciones.filter(
            s =>
                normalizarTexto(
                    s.tipoAcceso
                ) === "restringido"
        ).length;


    statRecursos.textContent =
        secciones.length;

    statCiclos.textContent =
        ciclos.size;

    statPublicos.textContent =
        publicos;

    statRestringidos.textContent =
        restringidos;

}


/* =====================================================
   SELECT DE CICLOS
===================================================== */

function generarFiltroCiclos() {

    filtroCiclo.innerHTML = `
        <option value="">
            Todos los ciclos
        </option>
    `;


    const ciclos =
        [
            ...new Set(
                secciones
                    .map(
                        s =>
                            String(
                                s.ciclo
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ];


    ciclos.sort(
        (a, b) =>
            Number(a) - Number(b)
    );


    ciclos.forEach(
        ciclo => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                ciclo;

            option.textContent =
                `Ciclo ${convertirRomano(ciclo)}`;

            filtroCiclo.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   TARJETAS DE CICLOS
===================================================== */

function generarTarjetasCiclos() {

    listaCiclos.innerHTML =
        "";


    const conteo =
        {};


    secciones.forEach(
        seccion => {

            const ciclo =
                String(
                    seccion.ciclo
                ).trim();

            conteo[ciclo] =
                (conteo[ciclo] || 0)
                + 1;

        }
    );


    Object
        .keys(conteo)
        .sort(
            (a, b) =>
                Number(a) - Number(b)
        )
        .forEach(
            ciclo => {


                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "cycle-card";


                button.innerHTML = `

                    <strong>
                        Ciclo
                    </strong>

                    <span class="cycle-number">
                        ${convertirRomano(ciclo)}
                    </span>

                    <span class="cycle-count">
                        ${conteo[ciclo]}
                        ${
                            conteo[ciclo] === 1
                            ?
                            "recurso"
                            :
                            "recursos"
                        }
                    </span>

                `;


                button.addEventListener(
                    "click",
                    () =>
                        seleccionarCiclo(
                            ciclo
                        )
                );


                listaCiclos.appendChild(
                    button
                );

            }
        );

}


/* =====================================================
   SELECCIONAR CICLO
===================================================== */

function seleccionarCiclo(
    ciclo
) {

    filtroCiclo.value =
        String(ciclo);

    buscador.value =
        "";

    filtroAcceso.value =
        "";

    aplicarFiltros();

    mostrarTodos.classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "biblioteca"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   FILTROS
===================================================== */

function aplicarFiltros() {

    const texto =
        normalizarTexto(
            buscador.value
        );


    const ciclo =
        String(
            filtroCiclo.value
        );


    const acceso =
        normalizarTexto(
            filtroAcceso.value
        );


    const resultados =
        secciones.filter(
            seccion => {


                const nombre =
                    normalizarTexto(
                        seccion.nombre
                    );


                const descripcion =
                    normalizarTexto(
                        seccion.descripcion
                    );


                const cicloSeccion =
                    String(
                        seccion.ciclo
                    );


                const accesoSeccion =
                    normalizarTexto(
                        seccion.tipoAcceso
                    );


                const coincideTexto =

                    !texto
                    ||
                    nombre.includes(texto)
                    ||
                    descripcion.includes(texto);


                const coincideCiclo =

                    !ciclo
                    ||
                    cicloSeccion === ciclo;


                const coincideAcceso =

                    !acceso
                    ||
                    accesoSeccion === acceso;


                return (

                    coincideTexto
                    &&
                    coincideCiclo
                    &&
                    coincideAcceso

                );

            }
        );


    mostrarSecciones(
        resultados
    );


    if (
        ciclo
        ||
        texto
        ||
        acceso
    ) {

        mostrarTodos.classList.remove(
            "hidden"
        );

    }

    else {

        mostrarTodos.classList.add(
            "hidden"
        );

    }

}


/* =====================================================
   MOSTRAR TARJETAS
===================================================== */

function mostrarSecciones(
    lista
) {

    contenedor.innerHTML =
        "";


    contador.textContent =
        lista.length === 1

        ? "1 recurso encontrado"

        : `${lista.length} recursos encontrados`;


    if (
        lista.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="empty-state">

                <strong>
                    No se encontraron recursos
                </strong>

                <p>
                    Modifica los filtros
                    o realiza otra búsqueda.
                </p>

            </div>

        `;

        return;

    }


    lista.forEach(
        seccion => {

            contenedor.appendChild(
                crearTarjeta(
                    seccion
                )
            );

        }
    );

}


/* =====================================================
   TARJETA
===================================================== */

function crearTarjeta(
    seccion
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "resource-card";


    const tipo =
        normalizarTexto(
            seccion.tipoAcceso
        );


    const restringido =
        tipo === "restringido";


    const url =
        validarUrl(
            seccion.driveUrl
        );


    article.innerHTML = `

        <span class="resource-cycle">

            Ciclo
            ${convertirRomano(
                seccion.ciclo
            )}

        </span>


        <h3>
            ${escaparHTML(
                seccion.nombre
            )}
        </h3>


        <p class="resource-description">

            ${
                escaparHTML(
                    seccion.descripcion
                )
                ||
                "Material académico disponible para este curso."
            }

        </p>


        <span
            class="
                access-badge
                ${
                    restringido
                    ?
                    "access-restricted"
                    :
                    "access-public"
                }
            "
        >

            ${
                restringido
                ?
                "Acceso restringido"
                :
                "Acceso público"
            }

        </span>


        <a
            class="resource-button"
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
        >

            ${
                restringido
                    ?
                    "Abrir recurso"
                    :
                    "Abrir biblioteca"
            }

            <span aria-hidden="true">
                ↗
            </span>

        </a>

    `;


    return article;

}


/* =====================================================
   ESCAPAR TEXTO
===================================================== */

function escaparHTML(
    texto
) {

    return String(
        texto || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   VALIDAR URL
===================================================== */

function validarUrl(
    valor
) {

    try {

        const url =
            new URL(
                String(valor)
            );


        if (
            url.protocol === "https:"
        ) {

            return url.href;

        }

    }

    catch {

        console.warn(
            "URL inválida:",
            valor
        );

    }


    return "#";

}


/* =====================================================
   ESTADOS
===================================================== */

function mostrarCarga() {

    contenedor.innerHTML = `

        <div class="loading-state">

            <div class="spinner"></div>

            <p>
                Cargando biblioteca...
            </p>

        </div>

    `;

}


function mostrarError(
    mensaje
) {

    contenedor.innerHTML = `

        <div class="error-state">

            <strong>
                Error al cargar la biblioteca
            </strong>

            <p>
                ${mensaje}
            </p>

        </div>

    `;

}


/* =====================================================
   LIMPIAR FILTROS
===================================================== */

function restablecerFiltros() {

    buscador.value =
        "";

    filtroCiclo.value =
        "";

    filtroAcceso.value =
        "";

    aplicarFiltros();

}


/* =====================================================
   EVENTOS
===================================================== */

buscador.addEventListener(
    "input",
    aplicarFiltros
);


filtroCiclo.addEventListener(
    "change",
    aplicarFiltros
);


filtroAcceso.addEventListener(
    "change",
    aplicarFiltros
);


limpiarFiltros.addEventListener(
    "click",
    restablecerFiltros
);


mostrarTodos.addEventListener(
    "click",
    restablecerFiltros
);


/* =====================================================
   MENÚ MÓVIL
===================================================== */

menuButton.addEventListener(
    "click",
    () => {

        const abierto =
            mainNav.classList.toggle(
                "open"
            );


        menuButton.setAttribute(
            "aria-expanded",
            abierto
        );

    }
);


mainNav
    .querySelectorAll("a")
    .forEach(
        enlace => {

            enlace.addEventListener(
                "click",
                () => {

                    mainNav.classList.remove(
                        "open"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );
