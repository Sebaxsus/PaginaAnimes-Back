import mysql from "mysql2/promise"

const config = {
    host: "localhost",
    user: "Desarrollo",
    port: 3306,
    password: "desarrollo",
    database: "pagcontent"
}

const connection = await mysql.createConnection(config)
export class AnimeModel {

    async #updateGenres() {

    }

    static async getAll({title}) {
        
        if (title) {
            const lowerTitle = title.toLowerCase() + "%"

            const [animesQ, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM anime WHERE LOWER(title) LIKE LOWER(?);",
                [lowerTitle]
            )
            
            const animes = await Promise.all(
                animesQ.map(async (anime) => {
                    const [generos] = await connection.query(
                        "SELECT genero.id,genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                        [anime.id]
                    )

                    return {...anime, genre: generos}
                })
            )

            return animes
        }

        if (title === undefined) {
            const [animeQ, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM anime;"
            )

            const anime = await Promise.all(
                animeQ.map(async (anime) => {
                    const [genre, structure] = await connection.query(
                        "SELECT genero.id,genero.name FROM genero RIGHT JOIN anime_genre on genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                        [anime.id]
                    )

                    return {...anime, genre: genre}
                    //genre?.length ? genre.map( (g) => {return [g.id,g.name]}) : genre
                })
            )

            return anime
        }

        return new Error("Que paso? 🤨")

    }

    static async getById({ id }) {

        try {
            const [anime] = await connection.query(
                "SELECT BIN_TO_UUID(id) as id, title, description, img FROM anime WHERE id = UUID_TO_BIN(?);",
                [id]
            )
    
            // Solicitando todos los generos ligados al anime con la id
    
            const [generos] = await connection.query(
                "SELECT genero.id,genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                [id]
            )

            // console.log("Prueba desestruturar query con solo un elemento en la lista: ", anime, anime[0], " Generos: ", generos)
            // Al verificar la longitud de un objeto anime[0] va a devolver undefined
            return anime?.length ? {...anime[0], genre: generos } : new Error("No existe el anime con esa ID!")
        } catch (e) {
            console.log("Error en el getById Anime: ",e)
            //return new Error(e.sqlMessage)
            return new Error("Internal Error!")
        }
        
    }

    static async create({ data }) {

        const {
            genre: genreData,
            title,
            desc,
            img,
        } = data

        const [uuidResult] = await connection.query("SELECT UUID() uuid;")
        const [{uuid}] = uuidResult

        try {
            await connection.beginTransaction()

            const result = await connection.query(
                "INSERT INTO anime (id, title, description, img) VALUES (UUID_TO_BIN(?), ?, ?, ?);",
                [uuid, title, desc, img]
            )

            await Promise.all(
                genreData.map(async (genero) => {
                    genero = genero.toLowerCase()
                    const query = await connection.query(
                        "INSERT INTO anime_genre (anime_id,genero_id) VALUES (UUID_TO_BIN(?), ?);",
                        [uuid, genero]
                    )
                })
            )

            await connection.commit()
        } catch (e) {
            console.log(e)
            await connection.rollback()
            return new Error("Error inesperado al crear el Anime!")
        }

        const [anime] = await connection.query(
            "SELCET BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM anime WHERE anime.id = UUID_TO_BIN(?);",
            [uuid]
        )

        const [generos] = await connection.query(
            "SELECT genero.id,genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
            [uuid]
        )

        // ######### Aqui Falta devolver los generos ligados al anime
        // ### Actualizacion ya devuelve los generos ligados al anime
        // Pero no de una consulta a la BD, asumiendo que para llegar aqui
        // No hubo errores, por lo que usar la query tampoco es necesario
        // Hasta generaria mas uso de recursos de manera innecesariamente

        // ### Actualizacion 2 Como se maneja los id de los generos en lugar de su nombre toca
        // Sacar los generos por una consulta
        return {...anime[0], genre: generos }
    }

    static async update({ id, data}) {
        // Filtrando el objeto de entrada data
        // Para obtener los atributos enviados y
        // Almacenar sus valores, Para enviarlos
        // En una consulta UPDATE dinamica
        const keys = []
        const values = []
        let genres = []

        Object.entries(data).map(([key, value]) => {
            if (value !== undefined) {
                // keys.push("title = ?")
                if (key === "genre") {
                    genres = value
                } else {
                    keys.push(`${key} = ?`)
                    values.push(value)
                }
            }
        })

        if (keys.length === 0 && genres.length === 0) {
            console.error("No se pasaron campos en la Peticion! 404")
            return false
        }

        // Aqui agrego al arreglo values de ultimo el id
        // Es decir pertenecera al ultimo ? de la query
        values.push(id)

        const query = `UPDATE anime SET ${keys.join(', ')} WHERE id = UUID_TO_BIN(?);`

        try {
            await connection.beginTransaction()

            const [result] = keys?.length ? await connection.query(query, values) : []

            const [generos] = await connection.query(
                "SELECT genero.id, genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                [id]
            )
            
            const [resultGenres] = genres?.length ? await Promise.all(
                genres.map(async (genero) => {
                    console.log([id, genero], generos.some((g) => {return g.id === genero}))
                    generos.some((g) => {return g.id === genero}) ? "" : await connection.query(
                        "INSERT INTO anime_genre (anime_id,genero_id) VALUES (UUID_TO_BIN(?),?);",
                        [id, genero]
                    )
                })
            ) : null
            console.log(result, resultGenres)
            if (result.affectedRows === 0 && resultGenres === null) {
                console.log("No se encontro el anime o No se hicieron Cambios 400, Filas Afectadas: ", result.affectedRows)
                await connection.rollback()
                return false
            } else {
                await connection.commit()
            }

        } catch (e) {
            console.log("Error actualizando el Anime: ", e)
            await connection.rollback()
            return false
            throw new Error("Error al actualizar el Anime")
        }

        const [updatedAnime] = await connection.query(
            "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM anime WHERE anime.id = UUID_TO_BIN(?);",
            [id]
        )

        const [generos] = await connection.query(
            "SELECT genero.id, genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
            [id]
        )
        
        return {...updatedAnime[0], genre: generos }
    }

    static async delete({id}) {

        try {
            await connection.beginTransaction()

            const [resultAnime] = await connection.query(
                "DELETE FROM anime WHERE anime.id = UUID_TO_BIN(?);",
                [id]
            )

            const [resultGenres] = await connection.query(
                "DELETE FROM anime_genre WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                [id]
            )

            await connection.commit()
        } catch (e) {
            console.log(e)
            await connection.rollback()
            return false
            throw new Error("Error al crear el Anime!")
        }
    }

}