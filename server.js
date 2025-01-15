const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configurar middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Permite las solicitudes desde el frontend

// Conexión a la base de datos usando promesas
const mysqlPromise = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Cambiar según tu configuración
  database: 'peliculas'
}).promise();

// Rutas
app.get('/', (req, res) => {
  console.log("Se solicitó la página principal.");
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para obtener todas las películas
app.get('/api/peliculas', async (req, res) => {
  try {
    console.log("Se está solicitando todas las películas.");
    const [results] = await mysqlPromise.query('SELECT * FROM peliculas');
    console.log("Películas obtenidas:", results);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener las películas:", err);
    res.status(500).send('Error al obtener las películas.');
  }
});

// Endpoint para obtener categorías
app.get('/api/categorias', async (req, res) => {
  try {
    console.log("Se está solicitando las categorías.");
    const [results] = await mysqlPromise.query('SELECT DISTINCT categoria FROM peliculas');
    console.log("Categorías obtenidas:", results);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener las categorías:", err);
    res.status(500).send('Error al obtener las categorías.');
  }
});

// Endpoint para obtener las 5 películas con mejor calificación
app.get('/api/peliculas/destacadas', async (req, res) => {
  try {
    const [results] = await mysqlPromise.query('SELECT * FROM peliculas ORDER BY calificacion DESC LIMIT 5');

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron películas destacadas.' });
    }

    res.json(results); // Enviar las películas destacadas en formato JSON
  } catch (err) {
    console.error("Error al obtener las películas destacadas:", err);
    res.status(500).json({ message: 'Error al obtener las películas destacadas.' });
  }
});

// Endpoint de búsqueda de películas por título
app.get('/api/buscar', async (req, res) => {
  const { query } = req.query;
  console.log(`Se solicitó la búsqueda de películas con término: ${query}`);
  try {
    const [results] = await mysqlPromise.query('SELECT * FROM peliculas WHERE titulo LIKE ?', [`%${query}%`]);
    if (results.length === 0) {
      console.log("No se encontraron resultados para la búsqueda.");
      res.status(404).send('No se encontraron resultados para la búsqueda.');
    } else {
      console.log("Resultados de búsqueda:", results);
      res.json(results);
    }
  } catch (err) {
    console.error("Error en el servidor al buscar películas:", err);
    res.status(500).send('Error en el servidor.');
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
