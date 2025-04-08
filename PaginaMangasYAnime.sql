DROP DATABASE IF EXISTS pagcontent;

CREATE DATABASE pagcontent;

USE pagcontent;

CREATE TABLE manga (
	id binary(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT("No definida, Require actualizar!."),
    img TEXT 
);

-- RENAME TABLE mangas TO manga;

CREATE TABLE genero (
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

CREATE TABLE manga_genre (
	manga_id BINARY(16) REFERENCES mangas(id),
    genero_id INT REFERENCES generos(id),
    PRIMARY KEY (manga_id, genero_id)
);

INSERT INTO genero (name) VALUES
("Drama"), 
("Action"),
("Crime"),
("Adventure"),
("Sci-Fi"),
("Romance"),
("Isekai"),
("Slice of Life");

INSERT INTO manga (title, description, img) VALUES
("En Otro Mundo", "Un socio muero y despierta en otro mundo.", "./Eula.jpg"),
("El desarrollador", "En esta historia se relata las desgracias que sufre un desarrollador de una multi-nacional.", "./Eula.jpg"),
("The hard Knight", "Un Cabellero que ha llevado una vida de abusos y malos lideres, que ha sobrevivido por su increible resiliencia.", "./Eula.jpg"),
("Enigma", "Unos investigadores intentar resolver el enigma de los numeros aleatorios en los sistemas", "./Eula.jpg"),
("La Caballera Inmortal", "Una joven con un gran potencial en la esgrima y caballeria, Es maldecida con la Inmortalidad por culpa de la corrupcion de su Familia Noble", "./Eula.jpg");

-- SELECT * FROM manga where LOWER(title) like LOWER("E") LIMIT 10;
-- Investigar (LIKE, startpoint() st_touches() system_user() sysdate() subtime() substr()
-- subdate() strcmp() str_to_date() srid() space() soundex() sin() sign() sha() second() sec_to_time() stddev_samp stddev std
-- row_count() rtrim() rpad() round() repeat() repeat() replace() release_lock() radians() random_bytes() rand() quote() quarter() power() polygon() polyfromtext() position() pi() 
-- period_diff() period_add() password() numpoints() numgeometries() numinteriorrings() now() name_const() multipoint() multipolygon() multilinestring() old_password()
-- oct() md5() ltrim() lpad() log() locate() localtime() length() left() least() load_file() linestring() linefromwkb() linefromtext() last_insert_id() isclosed()
--  is_ipv4() is_ipv6() inet_ntoa()  inet6_aton() ipv4_compat() extract() exp() export_set() ifnull() get_lock()  get_format() glength() geometryn() from_base64() endpoint()
-- encrypt() encode() des_encrypt() buffer() aes_encrypt() rank json_objectagg json_arrayagg interval grouping group_concat() aes_decrypt() convert

-- DROP TABLE genero;

select * from manga, genero;

INSERT INTO manga_genre (manga_id, genero_id) VALUES 
((SELECT manga.id FROM manga WHERE title = "En Otro Mundo"), (SELECT genero.id FROM genero WHERE name = "Isekai")),
((SELECT manga.id FROM manga WHERE title = "En Otro Mundo"), (SELECT genero.id FROM genero WHERE name = "Drama")),
((SELECT manga.id FROM manga WHERE title = "En Otro Mundo"), (SELECT genero.id FROM genero WHERE name = "Action")),
((SELECT manga.id FROM manga WHERE title = "El desarrollador"), (SELECT genero.id FROM genero WHERE name = "Slice of Life")),
((SELECT manga.id FROM manga WHERE title = "El desarrollador"), (SELECT genero.id FROM genero WHERE name = "Drama")),
((SELECT manga.id FROM manga WHERE title = "The hard Knight"), (SELECT genero.id FROM genero WHERE name = "Drama")),
((SELECT manga.id FROM manga WHERE title = "The hard Knight"), (SELECT genero.id FROM genero WHERE name = "Action")),
((SELECT manga.id FROM manga WHERE title = "The hard Knight"), (SELECT genero.id FROM genero WHERE name = "Crime")),
((SELECT manga.id FROM manga WHERE title = "The hard Knight"), (SELECT genero.id FROM genero WHERE name = "Adventure")),
((SELECT manga.id FROM manga WHERE title = "Enigma"), (SELECT genero.id FROM genero WHERE name = "Sci-Fi")),
((SELECT manga.id FROM manga WHERE title = "La Caballera Inmortal"), (SELECT genero.id FROM genero WHERE name = "Drama")),
((SELECT manga.id FROM manga WHERE title = "La Caballera Inmortal"), (SELECT genero.id FROM genero WHERE name = "Action")),
((SELECT manga.id FROM manga WHERE title = "La Caballera Inmortal"), (SELECT genero.id FROM genero WHERE name = "Adventure"));

-- Obtener Todos los mangas con sus generos // Obtener todo lo almacenado en la bd

SELECT BIN_TO_UUID(manga.id), manga.title, manga.description, manga.img, genero.name FROM ( ( manga RIGHT JOIN manga_genre ON manga.id = manga_genre.manga_id) LEFT JOIN genero ON manga_genre.genero_id = genero.id );

-- Obtener un manga usando su titulo Literal

SELECT BIN_TO_UUID(manga.id), manga.title, manga.description, manga.img FROM manga WHERE LOWER(title) = LOWER("La Caballera Inmortal");

-- Obtener los mangas ligados a un nombre de genero

SELECT BIN_TO_UUID(manga.id), manga.title, manga.description, manga.img, genero.name FROM ( ( manga RIGHT JOIN manga_genre ON manga.id = manga_genre.manga_id) LEFT JOIN genero ON manga_genre.genero_id = genero.id ) WHERE LOWER(genero.name) = LOWER("Drama");

-- Intento de obtener los generos ligados a un id [ NO SIRVE ]

SELECT genero.name from genero, manga_genre WHERE manga_genre.manga_id = UUID_TO_BIN('14a1b59d-09e0-11f0-95b8-a8a15907d61f');

-- Obtener los generos ligados a un id de manga

SELECT genero.name from genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN('14a1b59d-09e0-11f0-95b8-a8a15907d61f');

SELECT title FROM manga WHERE id = UUID_TO_BIN('14a1b59d-09e0-11f0-95b8-a8a15907d61f');

-- Busqueda en donde el titulo contega las partes iniciales del string
-- Usando el operador LIKE con el Wildcard caracter % para representar
-- Que busque todas los titulos que empiecen con el string

SELECT * FROM manga WHERE LOWER(title) LIKE LOWER("patch%");

SELECT * FROM genero;

CREATE TABLE anime (
	id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT ("No especificada, Requiere Actualizar!"),
    img TEXT NOT NULL
);

CREATE TABLE anime_genre (
	anime_id BINARY(16) REFERENCES anime(id),
    genero_id INT REFERENCES genero(id),
    PRIMARY KEY (anime_id, genero_id)
);

INSERT INTO anime (title, description, img) VALUES
("Tragones Y Mazmorras", "Sigue a un grupo de aventureros que, para sobrevivir en una mazmorra, cocinan y comen monstruos.", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_6v1Ml_n0uxWXOdR6TXTcR1gJLi7uBKyTGCaacagVkrwfwKXsVRM0Bh8&usqp=CAE&s"), -- GENEROS Fantasía, Aventura, Comedia
("Los diarios de la boticaria","Maomao, una joven esclava en la China imperial, utiliza sus habilidades médicas para resolver misterios en la corte.","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXx_VUAqja62eEkMsCSc5v_qqXemtm11EXsAEk_-EnhudziPZVeQXuUCI&usqp=CAE&s"), -- GENEROS Misterio, Drama, Histórico
("Frieren: Más allá del final del viaje","Una elfa inmortal reflexiona sobre su vida y las relaciones con sus compañeros mortales después de derrotar al rey demonio.","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz1E-7L_Y6DITZcV0jgNsgqo0RBW8Oz_U1QofnRhdwsc95hlvh_oiRGps&usqp=CAE&s"), -- Fantasía, Aventura, Drama
("DanDaDan","Dos adolescentes se enfrentan a fenómenos sobrenaturales y extraterrestres en una serie de aventuras llenas de acción y comedia.","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9QP0HgS0hpKwHqsIacqL2zG2FCP8zRrjRosESIr0eJZ_8SC0Trjl8Gz0&usqp=CAE&s"), -- GENEROS Acción, Comedia, Sobrenatura
("Solo Leveling","Sung Jin-Woo, un cazador débil, se convierte en el más fuerte después de enfrentarse a una misteriosa mazmorra.","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3SNFBcUKwdpQjqAYDEKBJFMhqutAU5dDKcB8kXHuG6mZsHoUSj7s06d0&usqp=CAE&s"); -- Generos Acción, Fantasía, Aventura

INSERT INTO genero (name) VALUES 
("Fantasy"),("Comedy"),("Mystery"),
("Historical"),("Supernatural"),("Dark Fantasy");

INSERT INTO anime_genre (anime_id, genero_id) VALUES 
( (SELECT id FROM anime WHERE title LIKE "Tragones%"), (SELECT id FROM genero WHERE name = "Fantasy") ),
( (SELECT id FROM anime WHERE title LIKE "Tragones%"), (SELECT id FROM genero WHERE name = "Adventure") ),
( (SELECT id FROM anime WHERE title LIKE "Tragones%"), (SELECT id FROM genero WHERE name = "Comedy") ),
( (SELECT id FROM anime WHERE title LIKE "Los diarios%"), (SELECT id FROM genero WHERE name = "Mystery") ),
( (SELECT id FROM anime WHERE title LIKE "Los diarios%"), (SELECT id FROM genero WHERE name = "Drama") ),
( (SELECT id FROM anime WHERE title LIKE "Los diarios%"), (SELECT id FROM genero WHERE name = "Historical") ),
( (SELECT id FROM anime WHERE title LIKE "Frieren%"), (SELECT id FROM genero WHERE name = "Fantasy") ),
( (SELECT id FROM anime WHERE title LIKE "Frieren%"), (SELECT id FROM genero WHERE name = "Adventure") ),
( (SELECT id FROM anime WHERE title LIKE "Frieren%"), (SELECT id FROM genero WHERE name = "Drama") ),
( (SELECT id FROM anime WHERE title = "DanDaDan"), (SELECT id FROM genero WHERE name = "Action") ),
( (SELECT id FROM anime WHERE title = "DanDaDan"), (SELECT id FROM genero WHERE name = "Comedy") ),
( (SELECT id FROM anime WHERE title = "DanDaDan"), (SELECT id FROM genero WHERE name = "Supernatural") ),
( (SELECT id FROM anime WHERE title LIKE "Solo%"), (SELECT id FROm genero WHERE name = "Action") ),
( (SELECT id FROM anime WHERE title LIKE "Solo%"), (SELECT id FROM genero WHERE name = "Fantasy") ),
( (SELECT id FROM anime WHERE title LIKE "Solo%"), (SELECT id FROM genero WHERE name = "Adventure") );

SELECT * FROM (anime RIGHT JOIN anime_genre on anime.id = anime_genre.anime_id ) LEFT JOIN genero ON anime_genre.genero_id = genero.id; 
-- Probando el Comportamiento de MySQL Workbench al hacer una peticion con una UUID valida pero no Existente en la BD
SELECT * FROM anime_genre WHERE anime_genre.anime_id = UUID_TO_BIN("222ab2bd-0b17-4e4e-8037-194e6e53038b");
-- Probando el Comportamiento de MySQL Workbench al hacer una peticion a varias tablas con un UUID Valida pero no Existente en la BD
SELECT genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN("222ab2bd-0b17-4e4e-8037-194e6e53038b");
-- Probando la respuesta a una consulta con una UUID Valida y Existente pero sin datos almacenados en la tabla anime_genre
SELECT genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN('229786cc-0f92-11f0-a178-a8a15907d61f');