import mysql from "mysql2/promise"

const config = {
    host: "localhost",
    user: "Desarrollo",
    port: 3306,
    password: "desarrollo",
    database: "pagcontent"
}

const connection = await mysql.createConnection(config)

export class searchModel {

    static async getAll({title, genre}) {

        // console.log(title, genre)

        if (title && genre) {
            // console.log("Entro 2")
            const lowerTitle = title.toLowerCase() + "%"
            /*
            La siguiente consulta se encarga de combinar los datos
            de las tablas anime, manga, anime_genre y manga_genre
            con el fin de filtrar los datos de las 4 tablas en una sola
            consulta en lugar de dos, Usando UNION ALL por rendiemiendo
            ya que UNION hace uso de DISTINCT lo cual consume mas que
            UNION ALL.

            Tambien agrego una nueva columna llamada *type* para distinguir
            de cual tabla viene el contenido, esto con el fin de hacer un
            solo map de mi respuesta inicial cambiando entre las tablas
            anime_genre, manga_genre usando el campo/propiedad type.

            Esto me permite devolver un objeto que contenga los datos
            de las dos tablas sin tener que unir dos respuestas.
            */
            const [result, resultStruct] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id,anime.title,anime.description,anime.img, 'Animes' as type FROM anime JOIN anime_genre ON anime.id = anime_genre.anime_id WHERE anime_genre.genero_id = ? AND lower(anime.title) LIKE lower(?) UNION ALL SELECT BIN_TO_UUID(manga.id) as id,manga.title,manga.description,manga.img, 'Mangas' as type FROM manga JOIN manga_genre ON manga.id = manga_genre.manga_id WHERE manga_genre.genero_id = ? AND lower(manga.title) LIKE lower(?);" 
                ,[genre, lowerTitle, genre, lowerTitle]
            )

            const data = await Promise.all(
                result.map(async (row) => {
                    const type = row.type === "Mangas" ? "manga" : "anime"
                    const [generos, generoStruc] = await connection.query(
                        `SELECT genero.id, genero.name FROM genero RIGHT JOIN ${type}_genre ON genero.id = ${type}_genre.genero_id WHERE ${type}_genre.${type}_id = UUID_TO_BIN(?);`,
                        [row.id]
                    )

                    return {...row, genre: generos}
                })
            )

            return data
        }

        if (title) {
            const lowerTitle = title.toLowerCase() + "%"
            // console.log("Entro title", lowerTitle)
            /*
            Aqui la consulta cambia, ya que no necesito las tablas
            anime_genre y manga_genre como el filtro se hace con base en
            El titulo y no los generos.

            Al final para devolver todos los generos ligados a un dato
            tengo que iterar atraves de las tablas genero y -
            manga_genre, anime_genre por esto no necesito las tablas relacionales
            en mi consulta con filtro.
            */
            const [result, resultStruct] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img, 'Animes' as type FROM anime WHERE lower(anime.title) LIKE lower(?) UNION ALL SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img, 'Mangas' as type FROM manga WHERE lower(manga.title) LIKE lower(?);"
                ,[lowerTitle, lowerTitle]
            )

            const data = await Promise.all(
                result.map(async (row) => {
                    const type = row.type === "Mangas" ? "manga" : "anime"
                    const [generos, generoStruc] = await connection.query(
                        `SELECT genero.id, genero.name FROM genero RIGHT JOIN ${type}_genre ON genero.id = ${type}_genre.genero_id WHERE ${type}_genre.${type}_id = UUID_TO_BIN(?);`,
                        [row.id]
                    )

                    return {...row, genre: generos}
                })
            )

            return data
        }

        if (genre) {
            // console.log("Entro genre ")
            /*
            Esta consulta si necesita las tablas relacionales
            anime_genre y manga_genre ya que el filtro se hace
            con base en el genero.
            */
            const [result, resultStruct] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id,anime.title,anime.description,anime.img,anime_genre.genero_id, 'Animes' as type FROM anime JOIN anime_genre ON anime.id = anime_genre.anime_id WHERE anime_genre.genero_id = ? UNION ALL SELECT BIN_TO_UUID(manga.id) as id,manga.title,manga.description,manga.img,manga_genre.genero_id, 'Mangas' as type FROM manga JOIN manga_genre ON manga.id = manga_genre.manga_id WHERE manga_genre.genero_id = ?;",
                [genre, genre]
            )

            const data = await Promise.all(
                result.map(async (row) => {
                    const type = row.type === "Mangas" ? "manga" : "anime"
 
                    const [generos, generoStruc] = await connection.query(
                        `SELECT genero.id, genero.name FROM genero RIGHT JOIN ${type}_genre ON genero.id = ${type}_genre.genero_id WHERE ${type}_genre.${type}_id = UUID_TO_BIN(?);`,
                        [row.id]
                    )

                    return {...row, genre: generos}
                })
            )

            return data
        }
        /*
        Aqui queria obligar a que la peticion contenga al menos un
        filtro, ya que los datos de las dos tablas manga, anime ya
        se almacenan en el cliente al renderizar.

        Por ahora lo voy a dejar asi, ya lo cambiare para que si devuelva
        los datos sin filtrar de las tres (3) tablas anime, manga y genero
        con sus relaciones de generos. 😫
        */
        if (title === undefined && genre === undefined) {
            const [result, resultStruct] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img, 'Animes' as type FROM anime UNION ALL SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img, 'Mangas' as type FROM manga;"
            )

            const data = await Promise.all(
                result.map(async (row) => {
                    const type = row.type === "Mangas" ? "manga" : "anime"

                    const [generos, generoStruc] = await connection.query(
                        `SELECT genero.id, genero.name FROM genero RIGHT JOIN ${type}_genre ON genero.id = ${type}_genre.genero_id WHERE ${type}_genre.${type}_id = UUID_TO_BIN(?);`,
                        [row.id]
                    )

                    return {...row, genre: generos}
                })
            )

            return data
        }

        return new Error("Que paso? 😒")
    }

    static async getRecent({type}) {

        // Type = 1 Significa que la peticion viene de mangas

        if (type === "Mangas") {
            /*
            Aqui la consulta cambia, ya que no necesito las tablas
            anime_genre y manga_genre como el filtro se hace con base en
            El titulo y no los generos.

            Al final para devolver todos los generos ligados a un dato
            tengo que iterar atraves de las tablas genero y -
            manga_genre, anime_genre por esto no necesito las tablas relacionales
            en mi consulta con filtro.
            */
            const [result, resultStruct] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img, 'Mangas' as type FROM manga ORDER BY id DESC LIMIT 4;"
            )

            const data = await Promise.all(
                result.map(async (manga) => {
                    const [generos, generoStruc] = await connection.query(
                        `SELECT genero.id, genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);`,
                        [manga.id]
                    )

                    return {...manga, genre: generos}
                })
            )

            return data
        }

        // Type = 2 Significa que la peticion viene de Animes

        if (type === "Animes") {
            // console.log("Entro genre ")
            /*
            Esta consulta si necesita las tablas relacionales
            anime_genre y manga_genre ya que el filtro se hace
            con base en el genero.
            */
            const [result, resultStruct] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img, 'Animes' as type FROM anime ORDER BY id DESC LIMIT 4;"
            )

            const data = await Promise.all(
                result.map(async (anime) => {
 
                    const [generos, generoStruc] = await connection.query(
                        `SELECT genero.id, genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);`,
                        [anime.id]
                    )

                    return {...anime, genre: generos}
                })
            )

            return data
        }
        /*
        Aqui queria obligar a que la peticion contenga al menos un
        filtro, ya que los datos de las dos tablas manga, anime ya
        se almacenan en el cliente al renderizar.

        Por ahora lo voy a dejar asi, ya lo cambiare para que si devuelva
        los datos sin filtrar de las tres (3) tablas anime, manga y genero
        con sus relaciones de generos. 😫
        */

        // Type = 0 Significa que la peticion viene del Home (Necesita datos de Mangas y Animes)
        if (type === undefined || type === "All") {
            const [result, resultStruct] = await connection.query(
                "(SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img, 'Animes' as type FROM anime ORDER BY id DESC LIMIT 2) UNION ALL (SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img, 'Mangas' as type FROM manga ORDER BY id DESC LIMIT 2);"
            )

            const data = await Promise.all(
                result.map(async (row) => {
                    const type = row.type === "Mangas" ? "manga" : "anime"

                    const [generos, generoStruc] = await connection.query(
                        `SELECT genero.id, genero.name FROM genero RIGHT JOIN ${type}_genre ON genero.id = ${type}_genre.genero_id WHERE ${type}_genre.${type}_id = UUID_TO_BIN(?);`,
                        [row.id]
                    )

                    return {...row, genre: generos}
                })
            )

            return data
        }

        return new Error("Que paso? 😒")
    }

}