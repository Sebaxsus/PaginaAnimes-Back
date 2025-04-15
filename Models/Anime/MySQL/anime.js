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

    static async getAll({ genre, title, limit, offset }) {

        if (genre && title) {
            const lowerTitle = title.toLowerCase() + "%"

            const [animesQ, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM ( (anime RIGHT JOIN anime_genre ON anime.id = anime_genre.anime_id) LEFT JOIN genero ON anime_genre.genero_id = genero.id ) WHERE genero.id = ? AND LOWER(anime.title) LIKE LOWER(?) ORDER BY anime.id DESC LIMIT ? OFFSET ?;",
                [genre, lowerTitle, limit, offset]
            )

            const [totalResult] = await connection.query(
                "SELECT COUNT(*) as total FROM ( (anime RIGHT JOIN anime_genre ON anime.id = anime_genre.anime_id) LEFT JOIN genero ON anime_genre.genero_id = genero.id ) WHERE genero.id = ? AND LOWER(anime.title) LIKE LOWER(?) ORDER BY anime.id DESC;",
                [genre, lowerTitle]
            )

            const animes = await Promise.all(
                animesQ.map(async (anime) => {
                    const [generos, struct] = await connection.query(
                        "SELECT genero.id, genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                        [anime.id]
                    )
                    return {...anime, genre: generos}
                })
            )

            return [animes, totalResult[0].total]
        }
        
        if (title) {
            const lowerTitle = title.toLowerCase() + "%"

            const [animesQ, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM anime WHERE LOWER(title) LIKE LOWER(?) ORDER BY id DESC LIMIT ? OFFSET ?;",
                [lowerTitle, limit, offset]
            )

            const [totalResult] = await connection.query(
                "SELECT COUNT(*) as total FROM anime WHERE LOWER(title) LIKE LOWER(?) ORDER BY id DESC;",
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

            return [animes, totalResult[0].total]
        }

        if (genre) {

            const [animesG, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM ( (anime RIGHT JOIN anime_genre ON anime.id = anime_genre.anime_id) LEFT JOIN genero ON anime_genre.genero_id = genero.id ) WHERE genero.id = ? ORDER BY anime.id DESC LIMIT ? OFFSET ?;",
                [genre, limit, offset]
            )

            const [totalResult] = await connection.query(
                "SELECT COUNT(*) as total FROM ( (anime RIGHT JOIN anime_genre ON anime.id = anime_genre.anime_id) LEFT JOIN genero ON anime_genre.genero_id = genero.id ) WHERE genero.id = ? ORDER BY anime.id DESC;",
                [genre]
            )

            const animes = await Promise.all(
                animesG.map(async (anime) => {
                    const [generos, struct] = await connection.query(
                        "SELECT genero.id, genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                        [anime.id]
                    )
                    return {...anime, genre: generos}
                })
            )

            return [animes, totalResult[0].total]
        }

        if (genre === undefined && title === undefined) {
            const [animeQ, queryStructure] = await connection.query(
                "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM anime ORDER BY id DESC LIMIT ? OFFSET ?;",
                [limit, offset]
            )

            const [totalResult] = await connection.query(
                "SELECT COUNT(*) as total FROM anime ORDER BY id DESC;"
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

            return [anime, totalResult[0].total]
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
            description,
            img,
        } = data

        const [uuidResult] = await connection.query("SELECT UUID() uuid;")
        const [{uuid}] = uuidResult

        try {
            await connection.beginTransaction()

            const result = await connection.query(
                "INSERT INTO anime (id, title, description, img) VALUES (UUID_TO_BIN(?), ?, ?, ?);",
                [uuid, title, description, img]
            )

            await Promise.all(
                genreData.map(async (genero) => {
                    
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
            "SELECT BIN_TO_UUID(anime.id) as id, anime.title, anime.description, anime.img FROM anime WHERE anime.id = UUID_TO_BIN(?);",
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
        const Gdelete = []
        const Ginsert = []

        Object.entries(data).map(([key, value]) => {
            // console.log("Map data: ", key, value)
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

        // const [generosT] = await connection.query(
        //     "SELECT genero.id, genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
        //     [id]
        // )
        // console.log(`Generos T: ${generosT} \nGeneros: ${generos}\ngenres: ${genres}\nQuery: ${query}\nKeys: ${keys}\nValues: ${values}`)
        // console.log(`Generos T: ${generosT}\ngenres: ${genres}\nQuery: ${query}\nKeys: ${keys}\nValues: ${values}`)
        // console.log(keys.length && genres.length ? true : false, genres.length ? true : false, keys.length ? true : false)

        // if (keys.length && genres.length) {
        //     console.log("Consulta exitosa: ", query,values)

        //     generosT.map((genero) => {
        //         // console.log(
        //         //     "Map generosT: ", genero,
        //         //     "\nGenero de  BD Esta en la Req ", genres.includes(genero.id),
        //         // )
        //         genres.includes(genero.id) ? genres.splice(genres.indexOf(genero.id), 1) : Gdelete.push(genero.id)

        //     })

        //     console.log(`DELETE FROM anime_genre WHERE anime_id = UUID_TO_BIN(${id}) AND genero_id = (${Gdelete});`)
        //     genres.forEach(genero => {
        //         console.log(`INSERT INTO anime_genre (anime_id,genero_id) VALUES (${id},${genres});`)
        //     })
        // } else {
        //     if (genres.length) {
        //         generosT.map((genero) => {
        //             // console.log(
        //             //     "Map generosT: ", genero,
        //             //     "\nGenero de  BD Esta en la Req ", genres.includes(genero.id),
        //             // )
        //             genres.includes(genero.id) ? genres.splice(genres.indexOf(genero.id), 1) : Gdelete.push(genero.id)
    
        //         })
    
        //         console.log(`DELETE FROM anime_genre WHERE anime_id = UUID_TO_BIN(${id}) AND genero_id IN (${Gdelete});`)
        //         genres.forEach(genero => {
        //             Ginsert.push(`(${id}, ${genero})`)
        //         })
        //         console.log(`INSERT INTO anime_genre (anime_id,genero_id) VALUES ${Ginsert.join(", ")};`)
                
        //     }

        //     if (keys.length) {
        //         console.log("Consulta exitosa: ", query,values)
        //     }
        // }

        try {
            await connection.beginTransaction()

            const [generos] = await connection.query(
                "SELECT genero.id, genero.name FROM genero RIGHT JOIN anime_genre ON genero.id = anime_genre.genero_id WHERE anime_genre.anime_id = UUID_TO_BIN(?);",
                [id]
            )
            // Los condicionales es para Discriminar/Separar 
            // Toda la logica segun que contenido esta vacio y que contenido
            // No
            // Es decir si todos los atributos de mi objeto data de mi peticion
            // Req.data estan vacios no hare nada
            // Pero si tengo al menos un atributo entre los siguientes
            // title, description, img Generare una consulta para actualizar
            // los datos de los campos enviados
            // Pero si solo tengo datos en mi atributo genre
            // Recorrere la lista de generos en busca de los cambios
            // y actualizare segun los cambios.
            if (keys.length && genres.length) {

                const [result] = await connection.query(query, values)
                // Obtener los generos del anime de la BD
                // Comparar cuales ya estan guardados, Cuales no y Cuales desaparecierion
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
                        "DELETE FROM anime_genre WHERE anime_id = UUID_TO_BIN(?) AND genero_id IN (?);",
                        [id, Gdelete]
                    )
                }
                if (Ginsert.length) {
                    await connection.query(
                        `INSERT INTO anime_genre (anime_id, genero_id) VALUES ${Ginsert.join(", ")};`
                    )
                }

                await connection.commit()
                
            } else {

                if (genres.length) {

                    /*
                        Explicacion de todo este mamotreto 🤗
                        
                        - Primero recorro toda la respuesta de mi consulta
                            incial (Obtener todos los generos guardados -
                            en la base de datos ligados a un anime_id)
                        - Dentro de la iteracion de mi respuesta 
                            (Arrglo de Objetos), Verifico con una ternaria ?
                            si alguno de los generos guardados en la BD estan
                            en la lista de generos de mi peticion (Request)

                            Si el genero que esta en el Arreglo de mi consulta
                            (BD), tambien esta en el Arreglo de mi PETICION (Req)
                            saco el Genero del arreglo de generos -
                            que viene en mi peticion (Req), Usando el metodo
                            Array.prototype.indexOf(genero.id) sabiendo que
                            genero.id es el mismo valor en los dos arreglos


                            Si el genero de mi BD no esta en el arreglo de
                            Generos de la PETICION (Req), Sé que desde el
                            Cliente lo quitaron de las Opciones, por ende
                            Lo agrego a un arreglo en donde guardo los id
                            De genero que se van a eliminar de la tabla
                            anime_genre.

                        - Segundo recorro el arreglo de Generos que viene
                            en mi PETICION (Request) luego de haber eliminado
                            los generos que ya estan en la BD, 
                            para agregar cada Genero de este arreglo
                            a una lista de Strings, en donde cada String
                            es un par (anime_id, genero_id) 
                        
                        - Tercero envio la consulta para ELIMINAR
                            Los registros que ligan a un anime con un genero
                            Usando la Clausula WHERE con la condicion
                            De que el id del anime almacenado coincida
                            Con el id de mi Anime actual

                            Ademas uso el Operador condicional AND
                            Para que tambien se deba cumplir la segunda
                            Condicion que consiste en los registros que
                            En el Campo *genero_id* Contenga alguna de las ID
                            De mi arreglo Gdelete,

                            Esto lo logro usando el Operador *IN*
                            Que es un abreviatrua para multiples Condiciones
                            OR.
                        
                        - Cuarto envio la consulta para INSERTAR
                            Un nuevo registro en la tabla anime_genre,
                            Para evitar hacer muchas peticiones a la BD
                            Uso el arreglo que contiene todos los valores
                            A registrar en esta tabla con los pares de Valores
                            (anime_id, genero_id) y los uno a una cadena
                            usando el metodo .join() con el separadot ", "
                            para que cada par de Valores quede separado
                            Correctamente "(), ()"
                    */
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
                            "DELETE FROM anime_genre WHERE anime_id = UUID_TO_BIN(?) AND genero_id IN (?);",
                            [id, Gdelete]
                        )
                    }
                    if (Ginsert.length) {
                        await connection.query(
                            `INSERT INTO anime_genre (anime_id, genero_id) VALUES ${Ginsert.join(", ")};`
                        )
                    }
                    
                    await connection.commit()

                }

                if (keys.length){

                    const [result] = await connection.query(query, values)

                    console.log(result)

                    if (result.affectedRows === 0) {

                        console.log("No se encontro el anime o No se hicieron Cambios 400, Filas Afectadas: ", result.affectedRows)
                        await connection.rollback()
                        return false

                    } else {

                        await connection.commit()

                    }
                }

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