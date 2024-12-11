function cargarResumenCompra() {
    const resumenCompraContainer = document.querySelector(".resumen-compra");

    const compraData = localStorage.getItem("compra");
    const compra = JSON.parse(compraData);

    const resumenHTML = `
        <div class="resumen-compra__container">
            <img src="/images/img_normales/${compra.sesionReservada.pelicula.imagenPequeniaUrl}" alt="Imagen de la Sesión" class="resumen-compra__image">
            <div class="resumen-compra__details">
                <h2 class="resumen-compra__details__title">Resumen de la Compra</h2>
                <p class="resumen-compra__details__info"><strong>Asientos:</strong> ${compra.asientosPosiciones.join(", ")}</p>
                <p class="resumen-compra__details__info"><strong>Total de Entradas:</strong> ${compra.numEntradas}</p>
                <p class="resumen-compra__details__price"><strong>Precio Total:</strong> ${compra.precio.toFixed(2)} €</p>
            </div>
        </div>
    `;

    resumenCompraContainer.innerHTML = resumenHTML;
}

function cargarFormularioPago() {
    const mainContainer = document.querySelector("main");

    const formularioHTML = `
        <div class="pago-container">
            <h2 class="pago-container__title">Formulario de Pago</h2>
            <div class="pago-container__content">
                <div class="pago__tarjeta">
                    <h3 class="pago__title">Información de la Tarjeta</h3>
                    <form id="paymentForm">
                        <div class="form-group">
                            <label for="cardNumber">Número de tarjeta</label>
                            <input type="number" id="cardNumber" placeholder="1234 5678 9012 3456">
                        </div>
                        <div class="form-row">
                            <div class="form-column">
                                <label for="expiryDate">Fecha de expiración</label>
                                <input type="text" id="expiryDate" placeholder="MM/AA">
                            </div>
                            <div class="form-column">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" placeholder="123">
                            </div>
                        </div>
                    </form>
                </div>

                <div class="pago__contacto">
                    <h3 class="pago__title">Información de Contacto</h3>
                    <form id="contactForm">
                        <div class="form-group">
                            <label for="name">Nombre</label>
                            <input type="text" id="name" placeholder="Nombre">
                        </div>
                        <div class="form-group">
                            <label for="surname">Apellidos</label>
                            <input type="text" id="surname" placeholder="Apellidos">
                        </div>
                        <div class="form-group">
                            <label for="email">Correo Electrónico</label>
                            <input type="email" id="email" placeholder="correo@ejemplo.com">
                        </div>
                    </form>
                </div>
            </div>
            <div class="pago-container__actions">
                <button type="button" id="submitButton" class="pagar-btn">Realizar Pago</button>
                <button type="button" id="cancelButton" class="cancelar-btn">Cancelar Pago</button>
            </div>
        </div>
    `;

    mainContainer.innerHTML += formularioHTML;

    // Añadimos los eventos para los botones
    document.getElementById("submitButton").addEventListener("click", realizarPago);
    document.getElementById("cancelButton").addEventListener("click", cancelarPago);
}

function cancelarPago() {
    const compraData = localStorage.getItem("compra");
    if (!compraData) {
        console.error("No se encontró la compra en localStorage.");
        alert("No se puede cancelar porque no hay datos de la compra.");
        return;
    }

    const compra = JSON.parse(compraData);
    const idSesion = compra.sesionReservada.id;
    const idsAsientos = compra.asientosIds;

    console.log("Enviando IDs de asientos para liberar:", idsAsientos);

    fetch(`http://54.242.122.114:7103/Sesion/${idSesion}/liberarAsientos`, {
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
            localStorage.removeItem("compra"); 
            window.location.href = "reservaasiento"; 
        })
        .catch(error => {
            console.error("Error durante el proceso:", error);
            alert("Hubo un problema al cancelar el pago. Inténtelo nuevamente.");
        });
}

function realizarPago() {
    const nombre = document.getElementById("name").value;
    const apellidos = document.getElementById("surname").value;

    const compraData = localStorage.getItem("compra");
    const compra = JSON.parse(compraData);

    const fechaActual = new Date();
    const fechaPago = fechaActual.toISOString(); // Enviar la fecha completa en formato ISO

    const compraPost = {
        usuario: `${nombre} ${apellidos}`,
        asientosPosiciones: compra.asientosPosiciones,
        sala: compra.sesionReservada.sala.id, // Cambiado a solo el ID de la sala
        numEntradas: compra.numEntradas,
        precio: compra.precio,
        fecha: fechaPago
    };

    fetch("http://54.242.122.114:7103/Compra", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(compraPost)
    })
        .then(response => {
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                return response.text().then(errorText => {
                    throw new Error(`Error al realizar la compra: ${errorText}`);
                });
            }

            // Procesar respuesta si tiene contenido
            const contentType = response.headers.get("Content-Type");
            return contentType && contentType.includes("application/json") ? response.json() : null;
        })
        .then(data => {
            if (data) {
                localStorage.setItem("idCompra", data.id);
            }
            window.location.href = "ticket"; // Redirigir a la página del ticket
        })
        .catch(error => {
            console.error("Error durante el proceso de compra:", error);
            alert("Hubo un problema al realizar la compra. Inténtelo nuevamente.");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarResumenCompra();
    cargarFormularioPago();
});
