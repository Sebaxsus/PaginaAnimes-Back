-- DROP DATABASE IF EXISTS moviesdb;
CREATE DATABASE moviesdb;

USE moviesdb;

CREATE TABLE movie (
	id binary(16) PRIMARY KEY DEFAULT(uuid_to_bin(uuid())),
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    director VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    poster TEXT,
    rate DECIMAL(2, 1) UNSIGNED NOT NULL
);

CREATE TABLE genre (
	id INT auto_increment primary key,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE movie_genre (
	movie_id BINARY(16) REFERENCES movie(id),
    genre_id INT REFERENCES genre(id),
    primary key (movie_id, genre_id)
);

INSERT INTO genre (name) VALUES 
("Drama"),
("Action"),
("Crime"),
("Adventure"),
("Sci-Fi"),
("Romance");

INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES 
(UUID_TO_BIN(UUID()), "The Shawshank Redemption", 1994, "Frank Darabont", 142,"https://i.ebayimg.com/images/g/4goAAOSwMyBe7hnQ/s-l1200.webp", 9.3),
(UUID_TO_BIN(UUID()), "The Dark Knight", 2008, "Christopher Nolan", 152,"https://i.ebayimg.com/images/g/yokAAOSw8w1YARbm/s-l1200.jpg", 9.0),
(UUID_TO_BIN(UUID()), "Inception", 2010, "Christopher Nolan", 148,"https://m.media-amazon.com/images/I/91Rc8cAmnAL._AC_UF1000,1000_QL80_.jpg", 8.8),
(UUID_TO_BIN(UUID()), "Pulp Fiction", 1994, "Quentin Tarantino", 154,"https://www.themoviedb.org/t/p/original/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg", 8.9);

INSERT INTO movie_genre (movie_id, genre_id) VALUES
	((SELECT id  FROM movie WHERE title = "The Shawshank Redemption"), (SELECT id FROM genre WHERE name = "Drama")),
    ((SELECT id  FROM movie WHERE title = "The Dark Knight"), (SELECT id FROM genre WHERE name = "Action")),
    ((SELECT id  FROM movie WHERE title = "The Dark Knight"), (SELECT id FROM genre WHERE name = "Crime")),
    ((SELECT id  FROM movie WHERE title = "The Dark Knight"), (SELECT id FROM genre WHERE name = "Drama")),
    ((SELECT id  FROM movie WHERE title = "Inception"), (SELECT id FROM genre WHERE name = "Action")),
    ((SELECT id  FROM movie WHERE title = "Inception"), (SELECT id FROM genre WHERE name = "Adventure")),
    ((SELECT id  FROM movie WHERE title = "Inception"), (SELECT id FROM genre WHERE name = "Sci-Fi")),
    ((SELECT id  FROM movie WHERE title = "Pulp Fiction"), (SELECT id FROM genre WHERE name = "Crime")),
    ((SELECT id  FROM movie WHERE title = "Pulp Fiction"), (SELECT id FROM genre WHERE name = "Drama"));
  
select *, BIN_TO_UUID(id) id from movie;
SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie;
SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE LOWER(title) = LOWER("INCEPTION");
SELECT * FROM movie_genre;
select * FROM genre;

-- No Se Como Funciona :)
SELECT BIN_TO_UUID(movie.id) as Movie_Id, movie.title, genre.name FROM ((movie INNER JOIN movie_genre on movie.id = movie_genre.movie_id) INNER JOIN genre on movie_genre.genre_id = genre.id) WHERE LOWER(movie.title) = LOWER("InCEPTION");

-- Obtengo la Lista de generos y datos de una pelicula usando un titulo
SELECT BIN_TO_UUID(movie.id), movie.title, genre.name FROM ((movie INNER JOIN movie_genre on movie.id = movie_genre.movie_id) INNER JOIN genre on movie_genre.genre_id = genre.id) WHERE LOWER(movie.title) = LOWER("Inception");

SELECT genre.name FROM genre INNER JOIN movie_genre ON genre.id = movie_genre.genre_id WHERE EXISTS (SELECT 1 FROM movie,movie_genre WHERE movie_genre.movie_id = (SELECT movie.id WHERE LOWER(movie.title) = LOWER("Inception") ));

-- Obtengo Solo la lista de Generos ligados a un titulo
SELECT genre.name from genre RIGHT JOIN movie_genre ON genre.id = movie_genre.genre_id WHERE (SELECT movie.id FROM movie WHERE LOWER(movie.title) = LOWER("InCEPTION")) = movie_genre.movie_id;

-- Obtengo las peliculas ligadas a un genero
-- No Sirvio `SELECT movie.title FROM movie WHERE (SELECT movie_genre.movie_id FROM movie_genre WHERE (SELECT genre.id FROM genre WHERE LOWER(genre.name) = LOWER("DRAMA"))) = movie.id;`

-- Si Sirve
SELECT * FROM ( ( movie INNER JOIN movie_genre ON movie.id = movie_genre.movie_id ) INNER JOIN genre on movie_genre.genre_id = genre.id ) WHERE LOWER(genre.name) = LOWER("DRAMA");
SELECT * FROM ( ( movie INNER JOIN movie_genre ON movie.id = movie_genre.movie_id ) INNER JOIN genre on movie_genre.genre_id = genre.id ) WHERE genre.id = 1;
SELECT * FROM ( ( movie INNER JOIN movie_genre ON movie.id = movie_genre.movie_id ) INNER JOIN genre on movie_genre.genre_id = genre.id );

-- Lo que hace arriba es Buscar todos los datos que se relaciones entra las tablas usando la id como condicion
-- Es decir si tengo la id de pelicula 1 (movie.id) y en mi tabla movie_genre hay algun id 1 guardado en el campo 
-- (movie_genre.movie_id) me mostrara todas las filas que tengan el (movie_id) en la tabla movie_genre
-- Asi funciona el INNER JOIN
-- Haciendo esto con las tres tablas relacionando las id puedo mostrar todos los datos que se relaciones entre tablas
-- Y luego los filtro con un condicional WHERE buscando lo que quiero

-- WHERE (SELECT movie_genre.genre_id FROM movie, movie_genre WHERE movie.id = movie_genre.movie_id) = genre.id

SELECT BIN_TO_UUID(movie.id) as Movie_id, title, year, director, duration, poster, rate, genre.name from genre , (movie LEFT join movie_genre on movie.id = movie_genre.movie_id) WHERE genre.id = 1;

-- Para ver todos los registros de las 3 tablas
SELECT * from (movie right join movie_genre on movie.id = movie_genre.movie_id) LEFT JOIN genre ON movie_genre.genre_id = genre.id ORDER BY genre.id;

SELECT BIN_TO_UUID(movie.id) as Movie_id, title, year, director, duration, poster, rate from movie RIGHT join movie_genre on movie.id = movie_genre.movie_id;

SELECT BIN_TO_UUID(movie.id) as id, movie.title, movie.year, movie.director, movie.duration, movie.poster, movie.rate, genre.name as genre FROM ( ( movie INNER JOIN movie_genre ON movie.id = movie_genre.movie_id ) INNER JOIN genre on movie_genre.genre_id = genre.id );

SELECT genre.name FROM genre inner join movie_genre on genre.id = movie_genre.genre_id where movie_genre.movie_id = UUID_TO_BIN("9093eee3-0787-11f0-842a-a8a15907d61f");