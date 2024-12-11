function cargarResumenCompraFinal() {
    const resumenContainer = document.querySelector(".resumen-compra");
    const idCompra = localStorage.getItem("idCompra"); // Obtener el ID de la compra desde localStorage
    if (!idCompra) {
        console.error("No se encontró el ID de la compra.");
        alert("No hay una compra registrada.");
        return;
    }

    fetch(`http://54.242.122.114:7103/Compra/${idCompra}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el resumen de la compra: ${response.statusText}`);
            }
            return response.json();
        })
        .then(compra => {
            const resumenHTML = `
                <div class="resumen-compra__container">
                    <div class="resumen-compra__details">
                        <h2 class="resumen-compra__details__title">Resumen de tu Compra</h2>
                        <p class="resumen-compra__details__info"><strong>Asientos:</strong> ${compra.asientosPosiciones.join(", ")}</p>
                        <p class="resumen-compra__details__info"><strong>Total de Entradas:</strong> ${compra.numEntradas}</p>
                        <p class="resumen-compra__details__info"><strong>Precio Total:</strong> ${compra.precio.toFixed(2)} €</p>
                        <button class="resumen-compra__button" id="volverHomeBtn">Volver al Inicio</button>
                    </div>
                </div>
            `;

            resumenContainer.innerHTML = resumenHTML;

            // Añadir evento al botón para redirigir a home.html
            document.getElementById("volverHomeBtn").addEventListener("click", () => {
                window.location.href = "home";
            });
        })
        .catch(error => {
            console.error("Error al cargar el resumen de la compra:", error);
            alert("Hubo un problema al cargar el resumen de la compra. Inténtalo nuevamente.");
        });
}

document.addEventListener("DOMContentLoaded", cargarResumenCompraFinal);
