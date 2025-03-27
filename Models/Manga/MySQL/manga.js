import mysql from "mysql2/promise"

const config = {
    host: "localhost",
    user: "Desarrollo",
    port: 3306,
    password: "desarrollo",
    database: "pagcontent"
}

const connection = await mysql.createConnection(config)

function getGeneros (id) {

    return []
}

export class MangaModel {

    static async getAll({ genre, title }) {
        
        let mangas = []

        if (title) {

            const LowerTitle = title.toLowerCase() + "%"

            const [mangas, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE LOWER(title) LIKE LOWER(?);",
                [LowerTitle]
            )

            return mangas
        }

        if (genre) {

            const LowerGenre = genre.toLowerCase()

            const [mangas, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img, genero.name FROM ( ( manga RIGHT JOIN manga_genre ON manga.id = manga_genre.manga_id) LEFT JOIN genero ON manga_genre.genero_id = genero.id ) WHERE LOWER(genero.name) = LOWER(?);",
                [genre]
            )

            return mangas
        }
        // Si la peticion no trae genero o title, genre y title sera undefined
        if (genre === undefined && title === undefined) {
            // Obtengo todos los mangas almacenados en la tabla
            const [mangasT, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga;"
            )
            // Espero el array de promesas que me genera el mangasT.map(async)
            // Necesito que sea una promesa para poder hacer la consulta sobre -
            // Los generos de cada Manga, para luego devolver un nuevo objeto que -
            // Contenga los datos del manga MAS sus generos como lista.
            // Nota: El front espera un arreglo de generos por eso toca hacer esto.
            mangas = await Promise.all(
                mangasT.map(async (manga) => {
                    const [genre, structure] = await connection.query(
                        "SELECT genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                        [manga.id]
                    )

                    return {...manga, genre: genre.map( (g) => {return g.name})}
                })
            )

            return mangas
        }

        return mangas

    }

    static async getById({ id }) {

        // ****** Esto parece estar mal, Ya que no devolvera las lista de generos del Manga. 0.o
        const [manga, mangaStructure] = await connection.query(
            "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE id = UUID_TO_BIN(?);",
            [id]
        )
        
        // Solicitando todos los generos ligados al manga con id

        const [generos, structure] = await connection.query(
            "SELECT genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
            [id]
        )
        return {...manga[0], genre: generos.map((genero) => {return genero.name})}

    }
    // POST | Input = req.body && DATA.
    static async create({ input }) {

        const {
            genre: genreInput,
            title,
            desc,
            img,
        } = input

        const [uuidResult] = await connection.query("SELECT UUID() uuid;")
        const [{uuid}] = uuidResult

        try {
            const result = await connection.query(
                "INSERT INTO manga (id, title, description, img) VALUES (UUID_TO_BIN(?), ?, ?, ?);",
                [uuid, title, desc, img]
            )
        } catch (e) {
            console.log(e)

            throw new Error("Error al crear el Manga!")
        }
        // Segun yo esto esta mal, Ya que si falla la query del try/catch esto se ejecutra igual mente
        genreInput.map(async (genre) => {
            genre = genre.toLowerCase()
            const result = await connection.query(
                "INSERT INTO manga_genre (manga_id, genero_id) VALUES (UUID_TO_BIN(?), (SELECT genero.id FROM genero WHERE LOWER(genero.name) = LOWER(?)) );",
                [uuid, genre]
            )
        })

        const [manga] = await connection.query(
            "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE id = UUID_TO_BIN(?);",
            [uuid]
        )

        return manga[0]

    }

    static async delete({ id }) {

        try {
            const result = connection.query(
                "DELETE FROM manga WHERE manga.id = UUID_TO_BIN(?);",
                [id]
            )
        } catch (e) {
            console.log(e)
            return false
            throw new Error("Error al crear el Manga")
        }

        return true

    }

    static async update({ id, input }) {
        // ******* Aqui no se esta teniendo en cuenta los generos
        // Al momento de actualizar, ya que solo se actualiza los campos de la tabla manga
        // y no se tiene en cuenta los campos de la tabal manga_genre o genero
        const keys = []
        const values = []

        Object.entries(input).map(([key, value]) => {
            if (value !== undefined) {
                keys.push(`${key} = ?`)
                values.push(value)
            }
        })

        if (keys.length === 0) {
            console.error("No se pasaron campos en la peticion! 404")
            return false
            throw new Error("No se pasaron campos en la peticion! 404")
        }

        values.push(id)

        const query = `UPDATE manga SET ${keys.join(', ')} WHERE id = UUID_TO_BIN(?);`

        try {
            const [result] = await connection.query(query, values)
            if (result.affectedRows === 0) {
                console.log("No se encontro la Manga o No se hicieron Cambios, Filas Afectadas: ", result.affectedRows)
                return false
            }
        } catch (e) {
            console.log("Error actualizando el Manga:", e)
            return false
            throw new Error("Error al actualizar el Manga")
        }

        const [updatedManga] = await connection.query(
            "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE manga.id = UUID_TO_BIN(?);",
            [id]
        )

        return updatedManga[0]

    }
    
}