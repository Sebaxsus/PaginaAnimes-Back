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

        if (genre && title) {

            const LowerTitle = title.toLowerCase() + "%"

            const [mangasQ, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM ( (manga RIGHT JOIN manga_genre ON manga.id = manga_genre.manga_id) LEFT JOIN genero ON manga_genre.genero_id = genero.id ) WHERE genero.id = ? AND LOWER(manga.title) LIKE LOWER(?) ORDER BY manga.id DESC;",
                [genre, LowerTitle]
            )
            
            const mangas = await Promise.all(
                mangasQ.map(async (manga) => {
                    const [generos, struct] = await connection.query(
                        "SELECT genero.id, genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                        [manga.id]
                    )
                    return {...manga, genre: generos }
                })
            )

            return mangas
        }

        if (title) {

            const LowerTitle = title.toLowerCase() + "%"

            const [mangasQ, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE LOWER(title) LIKE LOWER(?) ORDER BY id DESC;",
                [LowerTitle]
            )

            const mangas = await Promise.all(
                mangasQ.map(async (manga) => {
                    const [generos, generosStructure] = await connection.query(
                        "SELECT genero.id,genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                        [manga.id]
                    )

                    return {...manga, genre: generos }
                    // generos?.length ? generos.map((genero) => {return [genero.id,genero.name]}) : generos
            }))
            
            return mangas
        }

        if (genre) {

            const [mangasG, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM ( ( manga RIGHT JOIN manga_genre ON manga.id = manga_genre.manga_id) LEFT JOIN genero ON manga_genre.genero_id = genero.id ) WHERE genero.id = ? ORDER BY manga.id DESC;",
                [genre]
            )

            const mangas = await Promise.all(
                mangasG.map(async (manga) => {
                    const [generos, struct] = await connection.query(
                        "SELECT genero.id, genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                        [manga.id]
                    )
                    return {...manga, genre: generos}
                })
            )

            return mangas
        }
        // Si la peticion no trae genero o title, genre y title sera undefined
        if (genre === undefined && title === undefined) {
            // Obtengo todos los mangas almacenados en la tabla
            const [mangasT, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga ORDER BY id DESC;"
            )
            // Espero el array de promesas que me genera el mangasT.map(async)
            // Necesito que sea una promesa para poder hacer la consulta sobre -
            // Los generos de cada Manga, para luego devolver un nuevo objeto que -
            // Contenga los datos del manga MAS sus generos como lista.
            // Nota: El front espera un arreglo de generos por eso toca hacer esto.
            const mangas = await Promise.all(
                mangasT.map(async (manga) => {
                    const [genre, structure] = await connection.query(
                        "SELECT genero.id,genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                        [manga.id]
                    )

                    return {...manga, genre: genre}
                })
            )

            return mangas
        }

        return new Error("Que paso? 🤨")

    }

    static async getById({ id }) {

        try {
            // ****** Esto parece estar mal, Ya que no devolvera las lista de generos del Manga. 0.o
            const [manga, mangaStructure] = await connection.query(
                "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE id = UUID_TO_BIN(?);",
                [id]
            )
            
            // Solicitando todos los generos ligados al manga con id

            const [generos, structure] = await connection.query(
                "SELECT genero.id,genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                [id]
            )

            //console.log("Prueba desestruturar query con solo un elemento en la lista: ", manga, manga[0], " Generos: ", generos)
            return manga?.length ? {...manga[0], genre: generos} : new Error("No existe el manga con es ID!")

        } catch (e) {
            console.log("Error en el getById Manga: ",e)
            //return new Error(e.sqlMessage)
            return new Error("Internal Error!")
        }

    }
    // POST | Input = req.body && DATA.
    static async create({ input }) {

        const {
            genre: genreInput,
            title,
            description,
            img,
        } = input

        const [uuidResult] = await connection.query("SELECT UUID() uuid;")
        const [{uuid}] = uuidResult

        try {
            await connection.beginTransaction()

            const result = await connection.query(
                "INSERT INTO manga (id, title, description, img) VALUES (UUID_TO_BIN(?), ?, ?, ?);",
                [uuid, title, description, img]
            )

            await Promise.all(
                genreInput.map(async (genre) => {
                    genre = genre.toLowerCase()
                    const result = await connection.query(
                        "INSERT INTO manga_genre (manga_id, genero_id) VALUES (UUID_TO_BIN(?), ?);",
                        [uuid, genre]
                    )
                })
            )

            await connection.commit()
        } catch (e) {
            console.log(e)
            await connection.rollback()
            return new Error("Error interno al crear el Manga!")
        }
        // Segun yo esto esta mal, Ya que si falla la query del try/catch esto se ejecutra igual mente

        // ya se movio 😁

        const [manga] = await connection.query(
            "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE id = UUID_TO_BIN(?);",
            [uuid]
        )

        const [generos] = await connection.query(
            "SELECT genero.id,genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.anime_id = UUID_TO_BIN(?);",
            [uuid]
        )

        return {...manga[0], genre: generos }

    }

    static async delete({ id }) {

        try {
            await connection.beginTransaction()

            const [resultManga] = await connection.query(
                "DELETE FROM manga WHERE manga.id = UUID_TO_BIN(?);",
                [id]
            )

            const [resultGenres] = await connection.query(
                "DELETE FROM manga_genre WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                [id]
            )

            await connection.commit()
        } catch (e) {
            console.log(e)
            await connection.rollback()
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
        let genres = []
        const Gdelete = []
        const Ginsert = []

        Object.entries(input).map(([key, value]) => {
            if (value !== undefined) {
                if (key === "genre") {
                    genres = value
                } else {
                    keys.push(`${key} = ?`)
                    values.push(value)
                }
            }
        })

        if (keys.length === 0 && genres.length === 0) {
            console.error("No se pasaron campos en la peticion! 404")
            return false
            throw new Error("No se pasaron campos en la peticion! 404")
        }

        values.push(id)

        const query = `UPDATE manga SET ${keys.join(', ')} WHERE id = UUID_TO_BIN(?);`

        try {
            await connection.beginTransaction()

            const [generos] = await connection.query(
                "SELECT genero.id, genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
                [id]
            )

            if (keys.length && genres.length)  {

                console.log("Se cambiaran los siguientes datos: ", keys, genres)

                const [result] = await connection.query(query, values)
    
                generos.map((genero) => {
                    genres.includes(genero.id) ?
                        genres.splice(genres.indexOf(genero.id), 1) :
                        Gdelete.push(genero.id)
                })
                
                genres.forEach(genero => {
                    Ginsert.push(`(UUID_TO_BIN('${id}'), ${genero})`)
                })

                if (Gdelete.length) {
                    await connection.query(
                        "DELETE FROM manga_genre WHERE manga_id = UUID_TO_BIN(?) AND genero_id IN (?);",
                        [id, Gdelete]
                    )
                }

                if (Ginsert.length) {
                    await connection.query(
                        `INSERT INTO manga_genre (manga_id, genero_id) VALUES ${Ginsert.join(", ")};`
                    )
                }

                await connection.commit()

            } else {

                if (genres.length) {

                    console.log("Se cambiaran los siguientes generos: ", genres)

                    generos.map((genero) => {
                        genres.includes(genero.id) ?
                            genres.splice(genres.indexOf(genero.id), 1) :
                            Gdelete.push(genero.id)
                    })

                    genres.forEach(genero => {
                        Ginsert.push(`(UUID_TO_BIN('${id}'), ${genero})`)
                    })

                    if (Gdelete.length) {
                        await connection.query(
                            "DELETE FROM manga_genre WHERE manga_id = UUID_TO_BIN(?) AND genero_id IN (?);",
                            [id, Gdelete]
                        )
                    }

                    if (Ginsert.length) {
                        await connection.query(
                            `INSERT INTO manga_genre (manga_id, genero_id) VALUES ${Ginsert.join(", ")};`
                        )
                    }

                    await connection.commit()

                }

            }

            if (keys.length) {
                
                const [result] = await connection.query(query, values)
                
                console.log(result)

                if (result.affectedRows === 0) {
                    console.log("No se encontro la Manga o No se hicieron Cambios, Filas Afectadas: ", result.affectedRows)
                    await connection.rollback()
                    return false
                } else {
                    await connection.commit()
                }
                
            }


        } catch (e) {
            console.log("Error actualizando el Manga:", e)
            await connection.rollback()
            return false
            throw new Error("Error al actualizar el Manga")
        }

        const [updatedManga] = await connection.query(
            "SELECT BIN_TO_UUID(manga.id) as id, manga.title, manga.description, manga.img FROM manga WHERE manga.id = UUID_TO_BIN(?);",
            [id]
        )

        const [generos] = await connection.query(
            "SELECT genero.id,genero.name FROM genero RIGHT JOIN manga_genre ON genero.id = manga_genre.genero_id WHERE manga_genre.manga_id = UUID_TO_BIN(?);",
            [id]
        )

        return {...updatedManga[0], genre: generos }

    }
    
}