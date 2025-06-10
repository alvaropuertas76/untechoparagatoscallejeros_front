// Servidor Express para la API de Un Techo Para Gatos Callejeros
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { query, pool } = require('./database/db');
const { withTransaction, handleError } = require('./database/dbUtils');
const { validateCat, validateLogin } = require('./utils/validation');

// Crear una aplicación Express
const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas para usuarios
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await query('SELECT id, username, nombre, apellidos, rol, email FROM users');
    res.json(rows);
  } catch (error) {
    handleError(error, res, 'obtener usuarios');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const loginData = req.body;
    
    // Validar datos de inicio de sesión
    const validation = validateLogin(loginData);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const { username, password } = loginData;
    
    // En un entorno de producción, la contraseña debe estar hasheada
    const { rows } = await query(
      'SELECT id, username, nombre, apellidos, rol, email, password FROM users WHERE username = $1',
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    const user = rows[0];
    
    // En la versión actual, comparamos directamente las contraseñas
    // En producción, debes usar bcrypt.compare() para contraseñas hasheadas
    if (user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Eliminar la contraseña del objeto de usuario antes de enviarlo
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    handleError(error, res, 'iniciar sesión');
  }
});

// Rutas para gatos
app.get('/api/cats', async (req, res) => {
  try {
    // Obtener parámetros de consulta para filtrado
    const { nombre, sexo, adoptado, lugarRecogida } = req.query;
    
    let sqlQuery = `
      SELECT c.*, array_agg(cp.url) as fotos
      FROM cats c
      LEFT JOIN cat_photos cp ON c.id = cp.cat_id
      WHERE c.fecha_fallecido IS NULL
    `;
    
    const params = [];
    
    // Añadir filtros si están presentes
    if (nombre) {
      params.push(`%${nombre}%`);
      sqlQuery += ` AND c.nombre ILIKE $${params.length}`;
    }
    
    if (sexo !== undefined) {
      params.push(sexo === 'true');
      sqlQuery += ` AND c.sexo = $${params.length}`;
    }
    
    if (adoptado !== undefined) {
      params.push(adoptado === 'true');
      sqlQuery += ` AND c.adoptado = $${params.length}`;
    }
    
    if (lugarRecogida) {
      params.push(`%${lugarRecogida}%`);
      sqlQuery += ` AND c.lugar_recogida ILIKE $${params.length}`;
    }
    
    sqlQuery += ` GROUP BY c.id ORDER BY c.nombre`;
    
    const { rows } = await query(sqlQuery, params);
    
    res.json(rows);
  } catch (error) {
    handleError(error, res, 'obtener gatos');
  }
});

app.get('/api/cats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const catQuery = `
      SELECT c.*, array_agg(cp.url) as fotos
      FROM cats c
      LEFT JOIN cat_photos cp ON c.id = cp.cat_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    
    const { rows } = await query(catQuery, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Gato no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    handleError(error, res, 'obtener gato');
  }
});

app.post('/api/cats', async (req, res) => {
  try {
    const catData = req.body;
    
    // Validar datos del gato
    const validation = validateCat(catData);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const {
      nombre, fecha_nacimiento, lugar_recogida, testado, castrado, sexo,
      caracter, gato_aire_libre, gato_interior, familia, compatible_ninos,
      casa_tranquila, historia, apadrinado, adoptado, desaparecido,
      fecha_fallecido, ano_llegada, notas_salud, fotos
    } = catData;
    
    // Usar la función de transacción
    const result = await withTransaction(async (client) => {
      // Insertar el gato
      const insertCatQuery = `
        INSERT INTO cats (
          nombre, fecha_nacimiento, lugar_recogida, testado, castrado, sexo,
          caracter, gato_aire_libre, gato_interior, familia, compatible_ninos,
          casa_tranquila, historia, apadrinado, adoptado, desaparecido,
          fecha_fallecido, ano_llegada, notas_salud
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING id
      `;
      
      const catResult = await client.query(insertCatQuery, [
        nombre, fecha_nacimiento, lugar_recogida, testado, castrado, sexo,
        caracter, gato_aire_libre, gato_interior, familia, compatible_ninos,
        casa_tranquila, historia, apadrinado, adoptado, desaparecido,
        fecha_fallecido, ano_llegada, notas_salud
      ]);
      
      const catId = catResult.rows[0].id;
      
      // Insertar fotos si existen
      if (fotos && fotos.length > 0) {
        for (let i = 0; i < fotos.length; i++) {
          const url = fotos[i];
          const esPrincipal = i === 0; // La primera foto es la principal
          
          await client.query(
            'INSERT INTO cat_photos (cat_id, url, es_principal) VALUES ($1, $2, $3)',
            [catId, url, esPrincipal]
          );
        }
      }
      
      return { id: catId };
    });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Gato creado exitosamente' 
    });
  } catch (error) {
    handleError(error, res, 'crear gato');
  }
});

app.put('/api/cats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const catData = req.body;
    
    // Validar datos del gato
    const validation = validateCat(catData);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const {
      nombre, fecha_nacimiento, lugar_recogida, testado, castrado, sexo,
      caracter, gato_aire_libre, gato_interior, familia, compatible_ninos,
      casa_tranquila, historia, apadrinado, adoptado, desaparecido,
      fecha_fallecido, ano_llegada, notas_salud, fotos
    } = catData;
    
    // Usar la función de transacción
    const result = await withTransaction(async (client) => {
      // Actualizar el gato
      const updateCatQuery = `
        UPDATE cats SET
          nombre = $1,
          fecha_nacimiento = $2,
          lugar_recogida = $3,
          testado = $4,
          castrado = $5,
          sexo = $6,
          caracter = $7,
          gato_aire_libre = $8,
          gato_interior = $9,
          familia = $10,
          compatible_ninos = $11,
          casa_tranquila = $12,
          historia = $13,
          apadrinado = $14,
          adoptado = $15,
          desaparecido = $16,
          fecha_fallecido = $17,
          ano_llegada = $18,
          notas_salud = $19,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $20
        RETURNING id
      `;
      
      const catResult = await client.query(updateCatQuery, [
        nombre, fecha_nacimiento, lugar_recogida, testado, castrado, sexo,
        caracter, gato_aire_libre, gato_interior, familia, compatible_ninos,
        casa_tranquila, historia, apadrinado, adoptado, desaparecido,
        fecha_fallecido, ano_llegada, notas_salud, id
      ]);
      
      if (catResult.rowCount === 0) {
        throw { status: 404, message: 'Gato no encontrado' };
      }
      
      // Actualizar fotos si existen
      if (fotos && fotos.length > 0) {
        // Eliminar fotos existentes
        await client.query('DELETE FROM cat_photos WHERE cat_id = $1', [id]);
        
        // Insertar nuevas fotos
        for (let i = 0; i < fotos.length; i++) {
          const url = fotos[i];
          const esPrincipal = i === 0; // La primera foto es la principal
          
          await client.query(
            'INSERT INTO cat_photos (cat_id, url, es_principal) VALUES ($1, $2, $3)',
            [id, url, esPrincipal]
          );
        }
      }
      
      return { id: catResult.rows[0].id };
    });
    
    res.json({ 
      id: result.id, 
      message: 'Gato actualizado exitosamente' 
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    handleError(error, res, 'actualizar gato');
  }
});

app.delete('/api/cats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Marcar como fallecido en lugar de eliminar
    const { rows } = await query(
      'UPDATE cats SET fecha_fallecido = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Gato no encontrado' });
    }
    
    res.json({ message: 'Gato marcado como fallecido' });
  } catch (error) {
    handleError(error, res, 'marcar gato como fallecido');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${port}`);
});
