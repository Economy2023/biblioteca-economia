/* ======================================================
   CONFIGURACIÓN
====================================================== */

const SHEET_ID = "12NOm3qbdM7X0eA6NPCafV35p6rhENyCcanIs47ndLuw";

const SHEET_NAME = "Secciones";


/* ======================================================
   DATOS
====================================================== */

let cursos = [];

let semestreActivo = null;


/* ======================================================
   ELEMENTOS
====================================================== */

const semesterBooks =
    document.getElementById(
        "semesterBooks"
    );


const coursesGrid =
    document.getElementById(
        "coursesGrid"
    );


const semesterTitle =
    document.getElementById(
        "semesterTitle"
    );


const semesterDescription =
    document.getElementById(
        "semesterDescription"
    );


const semesterNumber =
    document.getElementById(
        "semesterNumber"
    );


const coursesEyebrow =
    document.getElementById(
        "coursesEyebrow"
    );


const buscador =
    document.getElementById(
        "buscador"
    );


const totalCursos =
    document.getElementById(
        "totalCursos"
    );


/* ======================================================
   FOOTER
====================================================== */

document.getElementById(
    "footerYear"
).textContent =
    `© ${new Date().getFullYear()}`;


/* ======================================================
   ROMANOS
====================================================== */

const ROMANOS = {

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


/* ======================================================
   ALTURA DE LOS LIBROS
====================================================== */

const ALTURAS = {

    1: 88,
    2: 94,
    3: 83,
    4: 91,
    5: 97,
    6: 86,
    7: 93,
    8: 81,
    9: 96,
    10: 89

};


/* ======================================================
   GOOGLE SHEETS
====================================================== */

google.charts.load(
    "current"
);


google.charts.setOnLoadCallback(
    cargarCursos
);



function cargarCursos() {

    const url =

        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`

        +

        `?sheet=${encodeURIComponent(SHEET_NAME)}`

        +

        `&headers=1`;


    const query =
        new google.visualization.Query(
            url
        );


    query.send(
        procesarRespuesta
    );

}



/* ======================================================
   PROCESAR RESPUESTA
====================================================== */

function procesarRespuesta(
    response
) {

    if (
        response.isError()
    ) {

        console.error(
            response.getMessage()
        );


        mostrarError();

        return;

    }


    const data =
        response.getDataTable();


    cursos = [];


    for (
        let fila = 0;
        fila < data.getNumberOfRows();
        fila++
    ) {

        const curso = {

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
                Number(
                    obtenerValor(
                        data,
                        fila,
                        2
                    )
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
                Number(
                    obtenerValor(
                        data,
                        fila,
                        7
                    )
                ) || 0

        };


        if (

            normalizar(
                curso.activo
            )

            ===

            "si"

        ) {

            cursos.push(
                curso
            );

        }

    }


    ordenarCursos();


    totalCursos.textContent =
        cursos.length;


    crearEstanteria();

}



/* ======================================================
   OBTENER CELDA
====================================================== */

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



/* ======================================================
   ORDENAR
====================================================== */

function ordenarCursos() {

    cursos.sort(

        (a, b) => {

            if (
                a.ciclo !== b.ciclo
            ) {

                return (
                    a.ciclo
                    -
                    b.ciclo
                );

            }


            return (
                a.orden
                -
                b.orden
            );

        }

    );

}



/* ======================================================
   CREAR LOS 10 LIBROS
====================================================== */

function crearEstanteria() {

    semesterBooks.innerHTML =
        "";


    for (
        let semestre = 1;
        semestre <= 10;
        semestre++
    ) {

        const cantidad =
            cursos.filter(

                curso =>
                    curso.ciclo === semestre

            ).length;


        const libro =
            document.createElement(
                "button"
            );


        libro.type =
            "button";


        libro.className =
            "semester-book";


        libro.dataset.semestre =
            semestre;


        libro.style.setProperty(

            "--book-height",

            `${ALTURAS[semestre]}%`

        );


        libro.setAttribute(

            "aria-label",

            `${ROMANOS[semestre]} semestre, ${cantidad} cursos`

        );


        libro.innerHTML = `

            <span class="book-title">

                ${ROMANOS[semestre]} SEMESTRE

            </span>


            <span class="book-count">

                ${cantidad}

            </span>

        `;


        libro.addEventListener(

            "click",

            () => {

                seleccionarSemestre(
                    semestre
                );

            }

        );


        semesterBooks.appendChild(
            libro
        );

    }

}



/* ======================================================
   SELECCIONAR SEMESTRE
====================================================== */

function seleccionarSemestre(
    semestre
) {

    semestreActivo =
        semestre;


    buscador.value =
        "";


    document
        .querySelectorAll(
            ".semester-book"
        )
        .forEach(

            libro => {

                libro.classList.remove(
                    "active"
                );

            }

        );


    const seleccionado =
        document.querySelector(

            `.semester-book[data-semestre="${semestre}"]`

        );


    if (
        seleccionado
    ) {

        seleccionado.classList.add(
            "active"
        );

    }


    const cursosSemestre =
        cursos.filter(

            curso =>
                curso.ciclo === semestre

        );


    semesterTitle.textContent =
        `${ROMANOS[semestre]} semestre`;


    semesterNumber.textContent =
        ROMANOS[semestre];


    coursesEyebrow.textContent =
        "Plan de estudios";


    semesterDescription.textContent =

        `${cursosSemestre.length} ${

            cursosSemestre.length === 1
                ?
                "curso disponible"
                :
                "cursos disponibles"

        } en este semestre.`;


    mostrarCursos(
        cursosSemestre
    );


    document
        .getElementById(
            "cursos"
        )
        .scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

}



/* ======================================================
   MOSTRAR CURSOS
====================================================== */

function mostrarCursos(
    lista
) {

    coursesGrid.innerHTML =
        "";


    if (
        lista.length === 0
    ) {

        coursesGrid.innerHTML = `

            <div class="empty-state">

                <strong>
                    Sin cursos registrados
                </strong>

                <p>
                    Todavía no hay recursos
                    registrados para este semestre.
                </p>

            </div>

        `;


        return;

    }


    lista.forEach(

        (
            curso,
            index
        ) => {

            const card =
                crearCurso(
                    curso,
                    index
                );


            coursesGrid.appendChild(
                card
            );

        }

    );

}



/* ======================================================
   CREAR CURSO
====================================================== */

function crearCurso(
    curso,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "course-card";


    const restringido =

        normalizar(
            curso.tipoAcceso
        )

        ===

        "restringido";


    const url =
        validarURL(
            curso.driveUrl
        );


    const numero =
        String(
            index + 1
        ).padStart(
            2,
            "0"
        );


    card.innerHTML = `

        <span class="course-number">

            ${numero}

        </span>


        <h3>

            ${escaparHTML(
                curso.nombre
            )}

        </h3>


        <p>

            ${

                escaparHTML(
                    curso.descripcion
                )

                ||

                "Material académico disponible para este curso."

            }

        </p>


        <div class="course-meta">


            <span class="access">

                ${

                    restringido
                        ?
                        "Acceso restringido"
                        :
                        "Acceso público"

                }

            </span>


            <a

                class="course-link"

                href="${url}"

                target="_blank"

                rel="noopener noreferrer"

                aria-label="Abrir ${escaparHTML(curso.nombre)}"

            >

                ↗

            </a>


        </div>

    `;


    return card;

}



/* ======================================================
   BUSCADOR
====================================================== */

buscador.addEventListener(

    "input",

    () => {

        const texto =
            normalizar(
                buscador.value
            );


        if (
            !texto
        ) {

            if (
                semestreActivo
            ) {

                seleccionarSemestre(
                    semestreActivo
                );

            }

            else {

                estadoInicial();

            }


            return;

        }


        document
            .querySelectorAll(
                ".semester-book"
            )
            .forEach(

                libro =>
                    libro.classList.remove(
                        "active"
                    )

            );


        const resultados =
            cursos.filter(

                curso => {

                    const nombre =
                        normalizar(
                            curso.nombre
                        );


                    const descripcion =
                        normalizar(
                            curso.descripcion
                        );


                    return (

                        nombre.includes(
                            texto
                        )

                        ||

                        descripcion.includes(
                            texto
                        )

                    );

                }

            );


        coursesEyebrow.textContent =
            "Resultados";


        semesterTitle.textContent =
            "Búsqueda";


        semesterNumber.textContent =
            resultados.length;


        semesterDescription.textContent =

            resultados.length === 1

            ?

            "1 curso encontrado."

            :

            `${resultados.length} cursos encontrados.`;



        mostrarCursos(
            resultados
        );



        document
            .getElementById(
                "cursos"
            )
            .scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

    }

);



/* ======================================================
   ESTADO INICIAL
====================================================== */

function estadoInicial() {

    coursesEyebrow.textContent =
        "Biblioteca académica";


    semesterTitle.textContent =
        "Selecciona un semestre";


    semesterNumber.textContent =
        "—";


    semesterDescription.textContent =
        "Elige uno de los libros del estante para visualizar los cursos disponibles.";


    coursesGrid.innerHTML = `

        <div class="initial-state">

            <span>
                01 — 10
            </span>

            <p>
                Los recursos aparecerán aquí
                al seleccionar un semestre.
            </p>

        </div>

    `;

}



/* ======================================================
   NORMALIZAR
====================================================== */

function normalizar(
    valor
) {

    return String(
        valor || ""
    )

        .trim()

        .toLowerCase()

        .normalize(
            "NFD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}



/* ======================================================
   ESCAPAR HTML
====================================================== */

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



/* ======================================================
   VALIDAR URL
====================================================== */

function validarURL(
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
            "URL incorrecta:",
            valor
        );

    }


    return "#";

}



/* ======================================================
   ERROR
====================================================== */

function mostrarError() {

    coursesGrid.innerHTML = `

        <div class="empty-state">

            <strong>
                No se pudo cargar el repositorio
            </strong>

            <p>
                Revisa la conexión con Google Sheets.
            </p>

        </div>

    `;

}
