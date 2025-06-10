-- Creación de tablas para la aplicación Un Techo Para Gatos Callejeros

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'voluntario', 'adopcion', 'veterinario')),
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de gatos
CREATE TABLE IF NOT EXISTS cats (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  lugar_recogida VARCHAR(100) NOT NULL,
  testado BOOLEAN DEFAULT FALSE,
  castrado BOOLEAN DEFAULT FALSE,
  sexo BOOLEAN NOT NULL, -- false = hembra, true = macho
  caracter TEXT,
  gato_aire_libre BOOLEAN DEFAULT FALSE,
  gato_interior BOOLEAN DEFAULT FALSE,
  familia BOOLEAN DEFAULT FALSE,
  compatible_ninos BOOLEAN DEFAULT FALSE,
  casa_tranquila BOOLEAN DEFAULT FALSE,
  historia TEXT,
  apadrinado BOOLEAN DEFAULT FALSE,
  adoptado BOOLEAN DEFAULT FALSE,
  desaparecido BOOLEAN DEFAULT FALSE,
  fecha_fallecido DATE,
  ano_llegada DATE NOT NULL,
  notas_salud TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar las fotos de los gatos
CREATE TABLE IF NOT EXISTS cat_photos (
  id SERIAL PRIMARY KEY,
  cat_id INTEGER REFERENCES cats(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  es_principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_cats_nombre ON cats(nombre);
CREATE INDEX idx_cats_adoptado ON cats(adoptado);
CREATE INDEX idx_cats_lugar_recogida ON cats(lugar_recogida);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_cat_photos_cat_id ON cat_photos(cat_id);
