const SHEET_ID = "12NOm3qbdM7X0eA6NPCafV35p6rhENyCcanIs47ndLuw";

const SHEET_NAME = "Secciones";

let secciones = [];

google.charts.load("current");

google.charts.setOnLoadCallback(cargarSecciones);


// =============================
// CARGAR GOOGLE SHEETS
// =============================

function cargarSecciones() {

    const url =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`
        + `?sheet=${encodeURIComponent(SHEET_NAME)}`
        + `&headers=1`;

    const query =
        new google.visualization.Query(url);

    query.send(procesarRespuesta);
}


// =============================
// PROCESAR RESPUESTA
// =============================

function procesarRespuesta(response) {

    const contenedor =
        document.getElementById("secciones");

    if (response.isError()) {

        console.error(
            "Error:",
            response.getMessage()
        );

        contenedor.innerHTML = `
            <p class="mensaje">
                No se pudo cargar la biblioteca.
            </p>
        `;

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

        secciones.push(seccion);
    }


    secciones.sort(
        (a, b) =>
            Number(a.orden || 0)
            -
            Number(b.orden || 0)
    );


    mostrarSecciones(secciones);
}


// =============================
// MOSTRAR TARJETAS
// =============================

function mostrarSecciones(lista) {

    const contenedor =
        document.getElementById("secciones");

    contenedor.innerHTML = "";

    const activas =
        lista.filter(seccion => {

            return String(
                seccion.activo || ""
            ).toUpperCase() === "SI";

        });


    if (activas.length === 0) {

        contenedor.innerHTML = `
            <p class="mensaje">
                No se encontraron secciones.
            </p>
        `;

        return;
    }


    activas.forEach(seccion => {

        const card =
            document.createElement("article");

        card.className = "card";


        // Título

        const titulo =
            document.createElement("h3");

        titulo.textContent =
            seccion.nombre;


        // Ciclo

        const ciclo =
            document.createElement("p");

        ciclo.className = "ciclo";

        ciclo.textContent =
            `Ciclo: ${seccion.ciclo}`;


        // Descripción

        const descripcion =
            document.createElement("p");

        descripcion.className =
            "descripcion";

        descripcion.textContent =
            seccion.descripcion || "";


        // Tipo de acceso

        const acceso =
            document.createElement("span");

        acceso.className = "acceso";


        if (
            String(seccion.tipoAcceso)
                .toLowerCase()
                === "restringido"
        ) {

            acceso.textContent =
                "🔒 Acceso restringido";

        } else {

            acceso.textContent =
                "Acceso público";

        }


        // Botón

        const boton =
            document.createElement("a");

        boton.className = "boton";

        boton.textContent =
            "Abrir biblioteca";

        boton.href =
            seccion.driveUrl;

        boton.target =
            "_blank";

        boton.rel =
            "noopener noreferrer";


        card.appendChild(titulo);

        card.appendChild(ciclo);

        card.appendChild(descripcion);

        card.appendChild(acceso);

        card.appendChild(boton);

        contenedor.appendChild(card);

    });

}


// =============================
// BUSCADOR
// =============================

document
    .getElementById("buscador")
    .addEventListener(
        "input",
        function () {

            const texto =
                this.value
                    .toLowerCase()
                    .trim();


            const resultados =
                secciones.filter(
                    seccion => {

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
                            ).toLowerCase();


                        return (
                            nombre.includes(texto)
                            ||
                            descripcion.includes(texto)
                            ||
                            ciclo.includes(texto)
                        );

                    }
                );


            mostrarSecciones(
                resultados
            );

        }
    );
