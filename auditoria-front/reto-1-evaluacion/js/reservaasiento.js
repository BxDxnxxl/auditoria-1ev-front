document.addEventListener("DOMContentLoaded", function () {
    const tablaAsientos = document.querySelector(".seating-chart");
    const botonComprar = document.getElementById("comprarBtn");
    const botonquitar = document.getElementById("quitarReserva");
    const listaResumen = document.getElementById("summary-list");
    const idSesion = localStorage.getItem('idSesion');
    let asientosSeleccionados = [];
    let asientosALiberar = [];
    let precioEntrada = 0;
    let TotalPrecio = 0;
    let Sesion;

    const urlApi = `https://localhost:7103/Sesion/${idSesion}`;

    function cargarAsientos() {
        fetch(urlApi)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de la API');
                }
                return response.json();
            })
            .then(sesion => {
                Sesion = sesion;
                const asientos = sesion.listaAsientos;
                precioEntrada = sesion.precio;

                // Llamamos a la función para generar la imagen y resumen dinámicamente
                actualizarResumenEstatico(sesion);
                generarAsientos(asientos, sesion.sala.Capacidad);
            })
            .catch(error => console.error("Error al cargar los asientos:", error));
    }

    function generarAsientos(asientos, capacidad) {
        const columnas = 5;
        const filas = Math.ceil(capacidad / columnas);

        while (tablaAsientos.firstChild) {
            tablaAsientos.removeChild(tablaAsientos.firstChild);
        }

        asientos.forEach((asiento, indice) => {
            const elementoAsiento = document.createElement("div");
            elementoAsiento.classList.add("seat");
            if (!asiento.ocupado) {
                elementoAsiento.style.backgroundColor = "green";
            } else {
                elementoAsiento.classList.add("ocupado");
                elementoAsiento.style.backgroundColor = "red";
            }

            const fila = Math.floor(indice / columnas) + 1;
            const columna = (indice % columnas) + 1;

            
                elementoAsiento.addEventListener("click", function () {
                    alternarSeleccionAsiento(elementoAsiento, asiento.id, fila, columna);
                });
                
            

            elementoAsiento.dataset.index = indice;
            elementoAsiento.dataset.selected = false;

            tablaAsientos.appendChild(elementoAsiento);
        });

        tablaAsientos.style.gridTemplateColumns = `repeat(${columnas}, 50px)`;
    }

    function alternarSeleccionAsiento(elementoAsiento, idAsiento, fila, columna) {
        if (elementoAsiento.style.backgroundColor === "green") {
            elementoAsiento.style.backgroundColor = "blue";
            elementoAsiento.dataset.selected = true;
            asientosSeleccionados.push({ id: idAsiento, fila, columna, precio: precioEntrada });
        } else if (elementoAsiento.style.backgroundColor === "blue") {
            elementoAsiento.style.backgroundColor = "green";
            elementoAsiento.dataset.selected = false;
            asientosSeleccionados = asientosSeleccionados.filter(asiento => asiento.id !== idAsiento);
        }else if (elementoAsiento.style.backgroundColor === "red") {
            asientosALiberar.push({ id: idAsiento, fila, columna, precio: precioEntrada });
            console.log(asientosALiberar)
        }
        actualizarResumen();
        actualizarBotonCompra();
    }



    function actualizarResumen() {
        listaResumen.innerHTML = "";

        let totalEntradas = 0;
        TotalPrecio = 0; // Reiniciar el precio total antes de recalcular

        asientosSeleccionados.forEach(asiento => {
            totalEntradas++;
            TotalPrecio += asiento.precio;

            const listItem = document.createElement("li");
            listItem.textContent = `Entrada F${asiento.fila} A${asiento.columna}  ${asiento.precio.toFixed(2)} €`;
            listaResumen.appendChild(listItem);
        });

        const totalItem = document.createElement("li");
        totalItem.textContent = `Total (${totalEntradas} Entradas)  ${TotalPrecio.toFixed(2)} €`;
        totalItem.style.borderTop = "1px solid #000";
        totalItem.style.marginTop = "10px";
        listaResumen.appendChild(totalItem);
    }

    function actualizarResumenEstatico(sesion) {
        const resumenContainer = document.querySelector(".summary");

        // Crear y agregar imagen
        const imagenPelicula = document.createElement("img");
        imagenPelicula.src = `/images/img_normales/${sesion.pelicula.imagenPequeniaUrl}`; // URL de la imagen desde la API
        imagenPelicula.alt = `Imagen de ${sesion.pelicula.nombre}`;
        imagenPelicula.style.width = "100%";
        imagenPelicula.style.borderRadius = "5px";
        imagenPelicula.style.marginBottom = "20px";

        resumenContainer.insertBefore(imagenPelicula, listaResumen);
    }

    function actualizarBotonCompra() {
        botonComprar.disabled = asientosSeleccionados.length === 0;
    }
    function cancelarPago() {
        console.log(asientosALiberar)
        const idsAsientos = asientosALiberar.map(asiento => asiento.id);
    
    
        console.log("Enviando IDs de asientos para liberar:", idsAsientos);
    
        fetch(`https://localhost:7103/Sesion/${idSesion}/liberarAsientos`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(idsAsientos)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al liberar los asientos: ${response.statusText}`);
                }
                console.log("Asientos liberados correctamente.");
            })
            .then(() => {
                window.location.href = "reservaasiento.html"; 
            })
            .catch(error => {
                console.error("Error durante el proceso:", error);
                alert("Hubo un problema al cancelar el pago. Inténtelo nuevamente.");
            });
    }
    function comprarAsientos() {
        const idsAsientos = asientosSeleccionados.map(asiento => asiento.id);
        const asientosPosiciones = asientosSeleccionados.map(asiento => `F${asiento.fila}-C${asiento.columna}`);

        fetch(`https://localhost:7103/Sesion/${idSesion}/actualizarAsientos`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(idsAsientos)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al actualizar los asientos en la API');
                }
            })
            .then(() => {
                const totalEntradas = asientosSeleccionados.length;
                const fechaCompra = new Date().toISOString();

                const compra = {
                    sesionReservada: Sesion,
                    asientosPosiciones: asientosPosiciones,
                    asientosIds: idsAsientos, // SE AÑADEN LOS IDs DE LOS ASIENTOS SELECCIONADOS
                    numEntradas: totalEntradas,
                    precio: TotalPrecio,
                    fecha: fechaCompra
                };

                localStorage.setItem("compra", JSON.stringify(compra));
                window.location.href = "pasarelapago";
            })
            .catch(error => console.error("Error al realizar la compra:", error));
    }

    botonComprar.addEventListener("click", comprarAsientos);
    botonquitar.addEventListener("click", cancelarPago);

    cargarAsientos();
});


