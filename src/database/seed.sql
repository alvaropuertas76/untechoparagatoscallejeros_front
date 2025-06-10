-- Inserción de datos de ejemplo para la aplicación Un Techo Para Gatos Callejeros

-- Insertar usuarios
INSERT INTO users (username, password, nombre, apellidos, rol, email) VALUES
('elena', 'lopez', 'Elena', 'Lopez', 'admin', 'elenalopezfernandez76@gmail.com'),
('voluntario1', 'vol123', 'María', 'González López', 'voluntario', 'maria@example.com'),
('voluntario2', 'vol456', 'Carlos', 'Martínez Ruiz', 'voluntario', 'carlos@example.com'),
('adopcion', 'adop123', 'Laura', 'Fernández Sánchez', 'adopcion', 'laura@example.com'),
('veterinario', 'vet123', 'Javier', 'Rodríguez Pérez', 'veterinario', 'javier@example.com');

-- Insertar gatos
INSERT INTO cats (
  nombre, fecha_nacimiento, lugar_recogida, testado, castrado, sexo, 
  caracter, gato_aire_libre, gato_interior, familia, compatible_ninos, 
  casa_tranquila, historia, apadrinado, adoptado, desaparecido, 
  fecha_fallecido, ano_llegada
) VALUES
(
  'Luna', '2020-05-15', 'Palma de Mallorca', true, true, false,
  'Gata muy cariñosa y tranquila. Le encanta estar en el regazo y ronronea constantemente. Es muy sociable con otros gatos.',
  false, true, true, true, false,
  'Luna fue encontrada en un parque de Palma cuando era muy pequeña. Llegó desnutrida pero se recuperó rápidamente. Ha demostrado ser una gata muy dulce y adaptable.',
  false, false, false, null, '2020-06-01'
),
(
  'Simba', '2019-03-22', 'Manacor', true, true, true,
  'Gato independiente pero muy juguetón. Le gusta explorar y es muy curioso. Puede ser un poco territorial al principio.',
  true, false, false, false, true,
  'Simba vivía en las calles de Manacor durante varios años. Fue rescatado después de ser atropellado levemente. Se ha adaptado bien pero prefiere espacios tranquilos.',
  true, false, false, null, '2021-08-15'
),
(
  'Mimi', '2021-12-10', 'Alcúdia', false, false, false,
  'Gatita muy joven y energética. Le encanta jugar y es muy sociable. Se lleva bien con otros gatos y perros pequeños.',
  false, true, true, true, false,
  'Mimi fue abandonada siendo muy pequeña en una caja cerca de Alcúdia. Ha crecido en el refugio y está lista para encontrar su hogar definitivo.',
  false, true, false, null, '2022-01-05'
),
(
  'Garfield', '2018-07-08', 'Inca', true, true, true,
  'Gato mayor muy tranquilo y sedentario. Perfecto para personas que buscan un compañero relajado. Le gusta dormir al sol.',
  false, true, true, true, true,
  'Garfield perteneció a una familia durante años, pero tuvieron que entregarlo por problemas de salud. Es un gato muy bien educado y cariñoso.',
  true, false, false, null, '2023-02-20'
),
(
  'Nala', '2020-11-30', 'Sóller', true, true, false,
  'Gata muy inteligente y observadora. Le gusta tener rutinas y puede ser selectiva con las personas, pero una vez que confía es muy leal.',
  true, true, false, false, true,
  'Nala fue encontrada herida en una trampa para ratones en Sóller. Después de su recuperación ha mostrado ser una gata muy especial que necesita el hogar adecuado.',
  false, false, false, null, '2021-01-10'
),
(
  'Whiskers', '2019-09-14', 'Pollença', false, false, true,
  'Gato muy activo y aventurero. Necesita mucho estímulo y ejercicio. Es perfecto para personas activas que puedan darle la atención que necesita.',
  true, false, true, true, false,
  'Whiskers fue rescatado de una colonia de gatos callejeros en Pollença. Aunque ha sido socializado, mantiene su instinto aventurero y necesita espacio para explorar.',
  false, false, true, null, '2020-10-05'
);

-- Insertar fotos de gatos
INSERT INTO cat_photos (cat_id, url, es_principal) VALUES
(1, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop', true),
(1, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=300&fit=crop', false),
(2, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop', true),
(3, 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop', true),
(3, 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=400&h=300&fit=crop', false),
(4, 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=300&fit=crop', true),
(5, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop', true),
(5, 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&h=300&fit=crop', false),
(5, 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&h=300&fit=crop', false),
(6, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop', true);
