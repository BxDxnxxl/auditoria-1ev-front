function fetchCategorias() {
    fetch('https://localhost:7103/Categoria')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener las categorías');
            }
            return response.json();
        })
        .then(data => {
            generarBotonesDeCategorias(data);
        })
        .catch(error => console.error('Error al obtener categorías:', error));
}

function fetchPeliculas() {
    fetch('https://localhost:7103/Pelicula')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de la API');
            }
            return response.json();
        })
        .then(data => {
            mostrarPeliculas(data);
            configurarBuscador(data);
        })
        .catch(error => console.error('Error al obtener películas:', error));
}

function fetchPeliculasPorCategoria(categoriaId) {
    fetch(`https://localhost:7103/Pelicula/categoria/${categoriaId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de la API');
            }
            return response.json();
        })
        .then(data => {
            mostrarPeliculas(data);
        })
        .catch(error => console.error('Error al obtener películas por categoría:', error));
}

function mostrarPeliculas(peliculas) {
    console.log(peliculas);
    const moviesContainer = document.querySelector('.movies__container');
    moviesContainer.innerHTML = '';

    peliculas.forEach(pelicula => {
        const peliculaHTML = `
            <div class="movie-card">
                <div class="movie-card__imagen__estandar">
                    <img src="../img/img_normales/${pelicula.imagenPequeniaUrl}" alt="${pelicula.nombre}" class="movie-card__image">
                </div>
                <h3 class="movie-card__title">${pelicula.nombre}</h3>
                <button class="movie-card__button" onclick="verMasInformacion('${pelicula.id}')">Más Información</button>
            </div>
        `;
        moviesContainer.innerHTML += peliculaHTML;
    });
}

function generarBotonesDeCategorias(categorias) {
    const categoriesList = document.querySelector('.categories__list');
    categoriesList.innerHTML = '';

    // Crear botón para todas las categorías
    const allButton = document.createElement('li');
    allButton.innerHTML = `<button id="0" class="categories__item active">All</button>`;
    categoriesList.appendChild(allButton);

    // Crear botones dinámicos para cada categoría
    categorias.forEach(categoria => {
        const categoriaButton = document.createElement('li');
        categoriaButton.innerHTML = `<button id="${categoria.id}" class="categories__item">${categoria.nombre}</button>`;
        categoriesList.appendChild(categoriaButton);
    });

    configurarBotonesDeCategorias();
}

function configurarBotonesDeCategorias() {
    const botonesCategorias = document.querySelectorAll('.categories__item');

    botonesCategorias.forEach(boton => {
        boton.addEventListener('click', () => {
            const categoriaId = boton.id;

            // Resaltar botón activo
            botonesCategorias.forEach(btn => btn.classList.remove('active'));
            boton.classList.add('active');

            // Cargar películas según categoría seleccionada
            if (categoriaId === "0") {
                fetchPeliculas();
            } else {
                fetchPeliculasPorCategoria(categoriaId);
            }
        });
    });
}

function configurarBuscador(peliculas) {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const peliculasFiltradas = peliculas.filter(pelicula =>
            pelicula.nombre.toLowerCase().includes(query)
        );
        mostrarPeliculas(peliculasFiltradas);
    });
}

function verMasInformacion(movieId) {
    localStorage.setItem('idPelicula', movieId);
    window.location.href = `detallepelicula.html?id=${movieId}`;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCategorias();
    fetchPeliculas();
});
