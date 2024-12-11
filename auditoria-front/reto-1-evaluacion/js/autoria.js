function fetchProductos() {
    fetch('https://localhost:7103/Producto')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener productos: ${response.statusText}`);
            }
            return response.json();
        })
        .then(productos => {
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error(error);
            document.getElementById('productos-container').innerHTML = '<p>Error al cargar productos.</p>';
        });
}

function mostrarProductos(productos) {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `producto-${producto.id}`;

        const fechaIngreso = new Date(producto.fechaIngreso).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p><strong>Descripción:</strong> ${producto.descripcion}</p>
            <p><strong>Tipo:</strong> ${producto.tipoProducto}</p>
            <p><strong>Precio:</strong>${producto.precio.toFixed(2)}€</p>
            <p><strong>Cantidad:</strong> ${producto.cantidadEnInventario}</p>
            <p><strong>Fecha de Ingreso:</strong> ${fechaIngreso}</p>
            <p class="${producto.disponible ? 'disponible' : 'no-disponible'}">
                ${producto.disponible ? 'Disponible' : 'No Disponible'}
            </p>
            <button class="delete-btn" onclick="deleteProducto(${producto.id})">Eliminar</button>
            <button class="edit-btn" onclick='showEditForm(${JSON.stringify(producto)})'>Editar</button>
        `;

        container.appendChild(card);
    });
}

function deleteProducto(id) {
    fetch(`https://localhost:7103/Producto/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar el producto');
            }
            fetchProductos();
        })
        .catch(error => console.error(error));
}

function showEditForm(producto) {
    const { id, nombre, descripcion, tipoProducto, cantidadEnInventario, precio, fechaIngreso, disponible } = producto;

    const card = document.getElementById(`producto-${id}`);
    
    const existingForm = document.querySelector('.form-container');
    if (existingForm) {
        existingForm.remove();
    }

    const fechaFormateada = fechaIngreso.split('T')[0];

    const form = document.createElement('div');
    form.className = 'form-container';
    form.innerHTML = `
        <h4>Editar Producto</h4>
        <input type="text" id="edit-nombre" value="${nombre}" placeholder="Nombre">
        <input type="text" id="edit-descripcion" value="${descripcion}" placeholder="Descripción">
        <input type="text" id="edit-tipo" value="${tipoProducto}" placeholder="Tipo de Producto">
        <input type="number" id="edit-cantidad" value="${cantidadEnInventario}" placeholder="Cantidad en Inventario">
        <input type="number" id="edit-precio" step="0.01" value="${precio}" placeholder="Precio">
        <input type="date" id="edit-fecha" value="${fechaFormateada}">
        <label for="edit-disponible">Disponible:</label>
        <select id="edit-disponible">
            <option value="true" ${disponible ? 'selected' : ''}>Sí</option>
            <option value="false" ${!disponible ? 'selected' : ''}>No</option>
        </select>
        <button onclick="submitEdit(${id})">Actualizar Producto</button>
    `;

    card.appendChild(form);
}

function submitEdit(id) {
    const updatedProducto = {
        nombre: document.getElementById('edit-nombre').value,
        descripcion: document.getElementById('edit-descripcion').value,
        tipoProducto: document.getElementById('edit-tipo').value,
        cantidadEnInventario: parseInt(document.getElementById('edit-cantidad').value),
        precio: parseFloat(document.getElementById('edit-precio').value),
        fechaIngreso: document.getElementById('edit-fecha').value,
        disponible: document.getElementById('edit-disponible').value === 'true'
    };

    fetch(`https://localhost:7103/Producto/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProducto)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el producto');
        }
        fetchProductos();
    })
    .catch(error => console.error(error));
}

fetchProductos();