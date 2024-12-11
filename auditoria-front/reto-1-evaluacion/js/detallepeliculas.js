const idPelicula = localStorage.getItem('idPelicula');

function fetchOpiniones(){
  fetch(`https://localhost:7103/Opinion/Pelicula/${idPelicula}/Opiniones`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener los datos de la película');
      }
      return response.json();
    })
    .then(data => {
      mostrarOpiniones(data);
    })
    .catch(error => console.error('Error al obtener la información de la película:', error));
}



function fetchInfoPelicula() {
  fetch(`https://localhost:7103/Sesion/Pelicula/${idPelicula}/Sesiones`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener los datos de la película');
      }
      return response.json();
    })
    .then(data => {
      mostrarPelicula(data[0].pelicula);
      setupMostrarSesiones(data);
    })
    .catch(error => console.error('Error al obtener la información de la película:', error));
}

function mostrarPelicula(pelicula) {
  const mainContent = document.getElementById('main-content');

  mainContent.innerHTML = `
    <div class="movie__banner" style="background-image: url('../img/banners/${pelicula.imagenBannerUrl}')">
      <div class="movie__banner-overlay"></div>
      <div class="movie__content">
        <div class="movie__poster">
          <img src="../img/img_normales/${pelicula.imagenPequeniaUrl}" alt="${pelicula.nombre}">
        </div>
        <div class="movie__info">
          <h1>${pelicula.nombre}</h1>
          <div class="rating">
            <span class="rating-icon">⭐</span>
            <span>${pelicula.valoracion}</span>
          </div>
          <p><strong>Duración:</strong> ${pelicula.duracion} minutos</p>
          <p class="description"><strong>Descripción:</strong> ${pelicula.descripcion}</p>
          <button class="sessions-button" onclick="toggleSesiones()">Sesiones Disponibles</button>
          <div class="sessions-container hidden"></div>
        </div>
      </div>    
      </div>
    </div>
  `;
}

function postOpinion(){
  const review = document.getElementById("opinion").value;
  const valoracion = document.getElementById("valoracion").value;
    const opinion = {
        review: review,
        peliculaId: idPelicula,
        puntuacion: valoracion,
        usuario: 'invitado', // Cambiado a solo el ID de la sala
    };
    if (valoracion > 5 || valoracion <0) {
      alert('la nota debe de ser mayor de 0 y menor a 5')
    }else{
      fetch("https://localhost:7103/Opinion", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(opinion)
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
              window.location.href = "detallepelicula.html"; // Redirigir a la página del ticket
          })
          .catch(error => {
              console.error("Error durante el proceso de compra:", error);
              alert("Hubo un problema al realizar la compra. Inténtelo nuevamente.");
          });
      }
}


function setupMostrarSesiones(sesiones) {
  const container = document.querySelector('.sessions-container');

  sesiones.forEach(sesion => {
    const card = document.createElement('div');
    card.className = 'session-card';
    card.innerHTML = `
      <p><strong>Fecha Inicio:</strong> ${new Date(sesion.fechaInicio).toLocaleString()}</p>
      <button onclick="irAComprar(${sesion.id})">Comprar</button>
    `;
    container.appendChild(card);
  });
}

function toggleSesiones() {
  const container = document.querySelector('.sessions-container');
  container.classList.toggle('hidden');
}

function mostrarOpiniones(opiniones) {
  let media = 0.0;
  let total = 0.0;
  let i = 0;
  opiniones.forEach(opinion=>{
    total += opinion.puntuacion; 
    i++;
  })
  media = total/i;
  console.log(media);
  console.log(opiniones)
  const mediahtml = document.querySelector('.mediaValor');
  mediahtml.innerHTML = `Media: ${media}`;
 const container = document.querySelector('.veropiniones-container');
 container.innerHTML = '';
  opiniones.forEach(opinion => {
    console.log(opinion)
    const fechaIngreso = new Date(opinion.fecha_creacion).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  });
    const opinionesHTML = `
      <h3>${opinion.review}</h1>
          <div class="rating">
            <span class="rating-icon">⭐</span>
            <span>${opinion.puntuacion}</span>
          </div>
          <p><strong>Usuario:</strong> ${opinion.usuario}</p> 
          <p><strong>Fecha de post:</strong> ${fechaIngreso}</p> 
    `;
    container.innerHTML += opinionesHTML;
});
}

function irAComprar(idSesion) {
  localStorage.setItem('idSesion', idSesion);
  window.location.href = 'reservaasiento.html';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchInfoPelicula();
  fetchOpiniones();
});
