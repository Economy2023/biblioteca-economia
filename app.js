const SHEET_ID = "12NOm3qbdM7X0eA6NPCafV35p6rhENyCcanIs47ndLuw";
const SHEET_NAME = "Secciones";

let secciones = [];

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


google.charts.load("current");

google.charts.setOnLoadCallback(
    cargarSecciones
);


/* =========================
   CARGAR GOOGLE SHEETS
========================= */

function cargarSecciones() {

    const url =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`
        + `?sheet=${encodeURIComponent(SHEET_NAME)}`
        + `&headers=1`;

    const query =
        new google.visualization.Query(url);

    query.send(procesarRespuesta);
}


/* =========================
   PROCESAR DATOS
========================= */

function procesarRespuesta(response) {

    if (response.isError()) {

        console.error(
            "Error:",
            response.getMessage()
        );

        contenedor.innerHTML = `
            <p class="mensaje">
                No fue posible cargar la biblioteca.
            </p>
        `;

        contador.textContent =
            "Error al cargar";

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
                data.getValue(fila, 0),

            nombre:
                data.getValue(fila, 1),

            ciclo:
                data.getValue(fila, 2),

            descripcion:
                data.getValue(fila, 3),

            tipoAcceso:
                data.getValue(fila, 4),

            driveUrl:
                data.getValue(fila, 5),

            activo:
                data.getValue(fila, 6),

            orden:
                data.getValue(fila, 7)

        };


        if (
            String(seccion.activo || "")
                .trim()
                .toUpperCase()
            === "SI"
        ) {

            secciones.push(seccion);

        }

    }


    ordenarSecciones();

    generarFiltroCiclos();

    aplicarFiltros();

}


/* =========================
   ORDEN
========================= */

function ordenarSecciones() {

    secciones.sort((a, b) => {

        const cicloA =
            Number(a.ciclo || 0);

        const cicloB =
            Number(b.ciclo || 0);


        if (cicloA !== cicloB) {
            return cicloA - cicloB;
        }


        return (
            Number(a.orden || 0)
            -
            Number(b.orden || 0)
        );

    });

}


/* =========================
   GENERAR CICLOS
========================= */

function generarFiltroCiclos() {

    const ciclos = [
        ...new Set(
            secciones
                .map(s => s.ciclo)
                .filter(Boolean)
        )
    ];


    ciclos.sort(
        (a, b) =>
            Number(a) - Number(b)
    );


    ciclos.forEach(ciclo => {

        const opcion =
            document.createElement("option");

        opcion.value =
            String(ciclo);

        opcion.textContent =
            `Ciclo ${ciclo}`;

        filtroCiclo.appendChild(opcion);

    });

}


/* =========================
   FILTROS
========================= */

function aplicarFiltros() {

    const texto =
        buscador.value
            .toLowerCase()
            .trim();

    const cicloSeleccionado =
        filtroCiclo.value;

    const accesoSeleccionado =
        filtroAcceso.value;


    const resultados =
        secciones.filter(seccion => {


            const nombre =
                String(
                    seccion.nombre || ""
                ).toLowerCase();


            const descripcion =
                String(
                    seccion.descripcion || ""
                ).toLowerCase();


            const ciclo =
                String(
                    seccion.ciclo || ""
                );


            const acceso =
                normalizarTexto(
                    seccion.tipoAcceso
                );


            const coincideTexto =
                nombre.includes(texto)
                ||
                descripcion.includes(texto);


            const coincideCiclo =
                !cicloSeleccionado
                ||
                ciclo === cicloSeleccionado;


            const coincideAcceso =
                !accesoSeleccionado
                ||
                acceso === accesoSeleccionado;


            return (
                coincideTexto
                &&
                coincideCiclo
                &&
                coincideAcceso
            );

        });


    mostrarSecciones(resultados);

}


/* =========================
   MOSTRAR RESULTADOS
========================= */

function mostrarSecciones(lista) {

    contenedor.innerHTML = "";


    contador.textContent =
        `${lista.length} ${
            lista.length === 1
                ? "recurso encontrado"
                : "recursos encontrados"
        }`;


    if (lista.length === 0) {

        contenedor.innerHTML = `
            <p class="mensaje">
                No encontramos recursos con esos filtros.
            </p>
        `;

        return;
    }


    lista.forEach(seccion => {

        const card =
            document.createElement("article");

        card.className = "card";


        const titulo =
            document.createElement("h3");

        titulo.textContent =
            seccion.nombre;


        const ciclo =
            document.createElement("p");

        ciclo.className = "ciclo";

        ciclo.textContent =
            `Ciclo ${seccion.ciclo}`;


        const descripcion =
            document.createElement("p");

        descripcion.className =
            "descripcion";

        descripcion.textContent =
            seccion.descripcion || "";


        const acceso =
            document.createElement("span");


        const tipo =
            normalizarTexto(
                seccion.tipoAcceso
            );


        if (tipo === "restringido") {

            acceso.className =
                "acceso restringido";

            acceso.textContent =
                "🔒 Acceso restringido";

        } else {

            acceso.className =
                "acceso publico";

            acceso.textContent =
                "Acceso público";

        }


        const boton =
            document.createElement("a");

        boton.className = "boton";

        boton.href =
            seccion.driveUrl;

        boton.target =
            "_blank";

        boton.rel =
            "noopener noreferrer";


        boton.textContent =
            tipo === "restringido"
                ? "Solicitar / abrir acceso"
                : "Abrir biblioteca";


        card.append(
            titulo,
            ciclo,
            descripcion,
            acceso,
            boton
        );


        contenedor.appendChild(card);

    });

}


/* =========================
   NORMALIZAR TEXTO
========================= */

function normalizarTexto(valor) {

    return String(valor || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


/* =========================
   EVENTOS
========================= */

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

        buscador.value = "";

        filtroCiclo.value = "";

        filtroAcceso.value = "";

        aplicarFiltros();

    }
);
