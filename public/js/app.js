document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const movieList = document.getElementById("movieList");
  const categoryList = document.getElementById("categoryList");
  const carouselItems = document.getElementById("carouselItems"); // Elemento del carrusel
  const categoryDropdown = document.getElementById("dynamicCategories");

  // Cargar películas al cargar la página
  cargarPeliculas();

  // Cargar categorías en el menú desplegable al cargar la página
  cargarCategoriasDesplegable();

  // Cargar categorías en tarjetas al cargar la página
  cargarCategorias();

  // Cargar películas destacadas al cargar la página
  cargarPeliculasDestacadas();

  // Manejar el evento de búsqueda
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevenir el envío del formulario

    const query = searchInput.value.trim();
    if (query) {
      try {
        const response = await fetch(`/api/buscar?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Error al buscar películas");

        const movies = await response.json();
        renderMovies(movies);
      } catch (error) {
        console.error(error);
        alert("Ocurrió un error al realizar la búsqueda. Inténtalo de nuevo.");
      }
    } else {
      alert("Por favor, ingresa un término de búsqueda.");
    }
  });

  // Función para cargar las películas desde el backend
  async function cargarPeliculas(categoria = '') {
    let url = '/api/peliculas';
    if (categoria) {
      url = `/api/categorias?categoria=${categoria}`;
    }
    try {
      const response = await fetch(url);
      const movies = await response.json();
      renderMovies(movies);
    } catch (error) {
      console.error('Error al cargar las películas:', error);
    }
  }

  // Función para cargar las categorías en el menú desplegable
  async function cargarCategoriasDesplegable() {
    try {
      const response = await fetch('/api/categorias');
      if (!response.ok) throw new Error('Error al obtener las categorías');
      const categorias = await response.json();

      if (categorias.length === 0) {
        categoryDropdown.innerHTML = "<li><a class='dropdown-item'>No hay categorías disponibles</a></li>";
        return;
      }

      categoryDropdown.innerHTML = categorias.map(
        category => `<li><a class="dropdown-item" href="#${category.categoria}">${category.categoria}</a></li>`
      ).join('');
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
      categoryDropdown.innerHTML = "<li><a class='dropdown-item'>Error al cargar las categorías</a></li>";
    }
  }

  // Función para cargar las categorías en las tarjetas
  async function cargarCategorias() {
    try {
      const response = await fetch('/api/categorias');
      const categorias = await response.json();
      console.log("Categorías cargadas:", categorias); // Depuración
      renderCategorias(categorias);
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
    }
  }

  // Función para renderizar las categorías en tarjetas
  function renderCategorias(categorias) {
    categoryList.innerHTML = ""; // Limpiar categorías anteriores

    if (categorias.length === 0) {
      categoryList.innerHTML = "<p class='text-center'>No se encontraron categorías.</p>";
      return;
    }

    categorias.forEach((categoria) => {
      const categoryName = categoria.categoria;

      const categoryCard = document.createElement("div");
      categoryCard.className = "col-md-3 mb-4 category-card";
      categoryCard.dataset.categoria = categoryName;

      categoryCard.innerHTML = `
        <div class="card" style="background-color: #f8f9fa;">
          <div class="card-body">
            <h5 class="card-title text-dark">${categoryName}</h5> 
          </div>
        </div>
      `;

      categoryList.appendChild(categoryCard);
    });
  }

  // Función para cargar las películas destacadas desde el backend
  async function cargarPeliculasDestacadas() {
    try {
      const response = await fetch('/api/peliculas/destacadas');
      if (!response.ok) throw new Error('No se encontraron películas destacadas');

      const peliculasDestacadas = await response.json();
      console.log("Películas destacadas:", peliculasDestacadas); // Depuración
      renderCarousel(peliculasDestacadas);
    } catch (error) {
      console.error('Error al cargar las películas destacadas:', error);
      carouselItems.innerHTML = "<p class='text-center'>Error al cargar las películas destacadas.</p>";
    }
  }

  // Función para renderizar el carrusel con las películas destacadas
  function renderCarousel(peliculasDestacadas) {
    carouselItems.innerHTML = ""; // Limpiar el carrusel anterior

    if (peliculasDestacadas.length === 0) {
      carouselItems.innerHTML = "<p class='text-center'>No hay películas destacadas.</p>";
      return;
    }

    peliculasDestacadas.forEach((movie, index) => {
      const isActive = index === 0 ? 'active' : '';
      const movieItem = document.createElement("div");
      movieItem.className = `carousel-item ${isActive}`;
      movieItem.innerHTML = `
        <img src="img/${movie.imagen}" class="d-block w-100" alt="${movie.titulo}">
        <div class="carousel-caption d-none d-md-block">
          <h5>${movie.titulo}</h5>
          <p>${movie.descripcion}</p>
        </div>
      `;
      carouselItems.appendChild(movieItem);
    });
  }

  // Función para renderizar las películas
  function renderMovies(movies) {
    movieList.innerHTML = ""; // Limpiar resultados anteriores

    if (movies.length === 0) {
      movieList.innerHTML = "<p class='text-center'>No se encontraron resultados.</p>";
      return;
    }

    movies.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.className = "col-md-4 mb-4";

      movieCard.innerHTML = `
        <div class="card">
          <img src="img/${movie.imagen}" class="card-img-top" alt="${movie.titulo}">
          <div class="card-body">
            <h5 class="card-title">${movie.titulo}</h5>
            <p class="card-text">${movie.descripcion}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-primary">⭐ ${movie.calificacion}</span>
              <a href="${movie.enlace_descarga}" class="btn btn-sm btn-success">Descargar</a>
            </div>
          </div>
        </div>
      `;

      movieList.appendChild(movieCard);
    });
  }
});
