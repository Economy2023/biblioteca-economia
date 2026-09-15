/* =====================================================
   CONFIGURACIÓN
===================================================== */

const SHEET_ID = "12NOm3qbdM7X0eA6NPCafV35p6rhENyCcanIs47ndLuw";

const SHEET_NAME = "Secciones";


/* =====================================================
   ESTADO GLOBAL
===================================================== */

let secciones = [];



/* =====================================================
   ELEMENTOS DEL DOM
===================================================== */

const buscador =
    document.getElementById("buscador");

const filtroCiclo =
    document.getElementById("filtroCiclo");

const filtroAcceso =
    document.getElementById("filtroAcceso");

const limpiarFiltros =
    document.getElementById("limpiarFiltros");

const contador =
    document.getElementById("contador");

const contenedor =
    document.getElementById("secciones");

const anioActual =
    document.getElementById("anioActual");



/* =====================================================
   PIE DE PÁGINA
===================================================== */

anioActual.textContent =
    `© ${new Date().getFullYear()}`;



/* =====================================================
   GOOGLE CHARTS
===================================================== */

google.charts.load("current");

google.charts.setOnLoadCallback(
    cargarSecciones
);



/* =====================================================
   CARGAR DATOS DESDE GOOGLE SHEETS
===================================================== */

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
   PROCESAR RESPUESTA
===================================================== */

function procesarRespuesta(response) {


    if (response.isError()) {

        console.error(
            "Error de Google Sheets:",
            response.getMessage()
        );


        mostrarError(
            "No fue posible cargar la biblioteca. Verifica la configuración del Google Sheet."
        );


        contador.textContent =
            "No se pudieron cargar los recursos";


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

    aplicarFiltros();

}



/* =====================================================
   OBTENER VALOR DE CELDA
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


    if (
        valor === null
        ||
        valor === undefined
    ) {

        return "";

    }


    return valor;

}



/* =====================================================
   ORDENAR
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

                return (
                    cicloA - cicloB
                );

            }



            const ordenA =
                Number(a.orden) || 0;

            const ordenB =
                Number(b.orden) || 0;


            return (
                ordenA - ordenB
            );

        }
    );

}



/* =====================================================
   CREAR FILTRO DE CICLOS
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
                        seccion =>
                            String(
                                seccion.ciclo
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


            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                ciclo;


            opcion.textContent =
                `Ciclo ${convertirCicloRomano(ciclo)}`;


            filtroCiclo.appendChild(
                opcion
            );

        }
    );

}



/* =====================================================
   FILTRAR
===================================================== */

function aplicarFiltros() {


    const texto =
        normalizarTexto(
            buscador.value
        );


    const cicloSeleccionado =
        String(
            filtroCiclo.value
        );


    const accesoSeleccionado =
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


                const ciclo =
                    String(
                        seccion.ciclo
                    ).trim();


                const tipoAcceso =
                    normalizarTexto(
                        seccion.tipoAcceso
                    );



                const coincideTexto =
                    !texto
                    ||
                    nombre.includes(texto)
                    ||
                    descripcion.includes(texto)
                    ||
                    ciclo.includes(texto);



                const coincideCiclo =
                    !cicloSeleccionado
                    ||
                    ciclo === cicloSeleccionado;



                const coincideAcceso =
                    !accesoSeleccionado
                    ||
                    tipoAcceso ===
                    accesoSeleccionado;



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

}



/* =====================================================
   MOSTRAR TARJETAS
===================================================== */

function mostrarSecciones(lista) {


    contenedor.innerHTML =
        "";



    actualizarContador(
        lista.length
    );



    if (
        lista.length === 0
    ) {


        contenedor.innerHTML = `
            <div class="empty-state">

                <strong>
                    No se encontraron recursos
                </strong>

                <p>
                    Intenta modificar la búsqueda
                    o los filtros seleccionados.
                </p>

            </div>
        `;


        return;

    }



    lista.forEach(
        seccion => {


            const card =
                crearTarjeta(
                    seccion
                );


            contenedor.appendChild(
                card
            );

        }
    );

}



/* =====================================================
   CREAR TARJETA
===================================================== */

function crearTarjeta(seccion) {


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "card";



    /* -------------------------
       NOMBRE
    ------------------------- */

    const titulo =
        document.createElement(
            "h3"
        );


    titulo.textContent =
        seccion.nombre;



    /* -------------------------
       CICLO
    ------------------------- */

    const ciclo =
        document.createElement(
            "p"
        );


    ciclo.className =
        "ciclo";


    ciclo.textContent =
        `Ciclo ${convertirCicloRomano(
            seccion.ciclo
        )}`;



    /* -------------------------
       DESCRIPCIÓN
    ------------------------- */

    const descripcion =
        document.createElement(
            "p"
        );


    descripcion.className =
        "descripcion";


    descripcion.textContent =
        seccion.descripcion
        ||
        "Material académico disponible para este curso.";



    /* -------------------------
       ACCESO
    ------------------------- */

    const acceso =
        document.createElement(
            "span"
        );


    const tipo =
        normalizarTexto(
            seccion.tipoAcceso
        );



    if (
        tipo === "restringido"
    ) {


        acceso.className =
            "acceso restringido";


        acceso.textContent =
            "🔒 Acceso restringido";


    }

    else {


        acceso.className =
            "acceso publico";


        acceso.textContent =
            "● Acceso público";

    }



    /* -------------------------
       BOTÓN
    ------------------------- */

    const boton =
        document.createElement(
            "a"
        );


    boton.className =
        "boton";


    boton.href =
        validarUrl(
            seccion.driveUrl
        );


    boton.target =
        "_blank";


    boton.rel =
        "noopener noreferrer";



    boton.textContent =
        tipo === "restringido"
        ?
        "Abrir recurso restringido ↗"
        :
        "Abrir biblioteca ↗";



    /* -------------------------
       ENSAMBLAR
    ------------------------- */

    card.append(
        titulo,
        ciclo,
        descripcion,
        acceso,
        boton
    );


    return card;

}



/* =====================================================
   CONTADOR
===================================================== */

function actualizarContador(
    cantidad
) {


    if (
        cantidad === 1
    ) {


        contador.textContent =
            "1 recurso encontrado";


    }

    else {


        contador.textContent =
            `${cantidad} recursos encontrados`;

    }

}



/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function normalizarTexto(
    valor
) {


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



/* =====================================================
   CONVERTIR CICLO A ROMANO
===================================================== */

function convertirCicloRomano(
    ciclo
) {


    const numerosRomanos = {

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
        numerosRomanos[numero]
        ||
        ciclo
    );

}



/* =====================================================
   VALIDAR URL
===================================================== */

function validarUrl(
    url
) {


    const valor =
        String(
            url || ""
        ).trim();


    try {


        const destino =
            new URL(valor);


        if (
            destino.protocol === "https:"
        ) {


            return destino.href;

        }


    }

    catch (error) {

        console.warn(
            "URL inválida:",
            valor
        );

    }


    return "#";

}



/* =====================================================
   ESTADO DE CARGA
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



/* =====================================================
   ERROR
===================================================== */

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
    () => {


        buscador.value =
            "";


        filtroCiclo.value =
            "";


        filtroAcceso.value =
            "";


        aplicarFiltros();


        buscador.focus();

    }
);
