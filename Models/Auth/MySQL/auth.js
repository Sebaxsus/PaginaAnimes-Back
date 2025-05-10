import crypto from "node:crypto"
import bcrypt from "bcrypt"
import mysql from "mysql2/promise.js"

const config = {
    host: "localhost",
    user: "Desarrollo",
    port: 3306,
    password: "desarrollo",
    database: "pagcontent"
}

const connection = await mysql.createConnection(config)

// Tokens se comporta como un diccionario (clave:valor)
// Hay que tener en cuenta que no es lo mismo que un objeto
// Ya que en los objetos la clave tiene que ser un string o symbol,
// Pero en los Map (Estructura de datos [dict]) la calve puede ser 
// Cualquier tipo de dato (int, str, float, etc..)

// Tambien cuenta con metodos como `.set(), .get(), .has(), .delete(), .clear()`
// Y tienen mejor rendimiento en estructuras de datos grandes
const tokens = new Map()


export class AuthModel {
    static async crearUsuario({ data }) {
        // console.log("usuario Data: ", data)
        const {
            user,
            email,
            password
        } = data
        const saltRounds = 10

        const hash = await bcrypt.hash(password, saltRounds)
        console.log("Entro crear Usuario Data: ", user, " email ", email, " pass ", password, " hash ", hash)

        try {
            await connection.beginTransaction()

            const saltRounds = 10

            const hash = await bcrypt.hash(password, saltRounds)

            const [result] = await connection.query(
                "INSERT INTO usuario (user, email, password) VALUES (?, ?, ?);",
                [user, email, hash]
            )

            await connection.commit()

            return result
        } catch (e) {
            console.log("Fallo el try crearUsuario: ", e)
            await connection.rollback()
            return new Error("Error inesperado al crear el usuario")
        }

    }

    static async actualizarUsuario({ data }) {
        const keys = []
        const values = []

        for (const [key, value] of Object.entries(data) ) {
            if (value !== undefined) {
                // Debo asegurarme que el nombre de atributo sea (user, email, password)

                // Si es un arreglo de promesas lo que genera el map, Pero no lo uso
                // Deberia aun asi esperar keys.push?? | Hice el map un funcion asincrona
                // Para poder hashear la pass con bcrypt
                if (key === "password") {
                    const saltRounds = 10
                    const hash = await bcrypt.hash(value, saltRounds)
                    keys.push(`${key} = ?`)
                    values.push(hash)
                } else {
                    keys.push(`${key} = ?`)
                    values.push(value)
                }
            }
        }

        if (keys.length === 0) {
            console.error("No se pasaron campos en la Peticion!, 404")
            return new Error("No se pasaron campos para actualizar!")
        }

        // Debo asegurarme de enviar el email para poder
        // Obtener el id de usuario
        const [id] = await connection.query(
            "SELECT id FROM usuario WHERE email = ?;",
            [data.email]
        )
    
        values.push(id[0].id)

        const query = `UPDATE usuario SET ${keys.join(", ")} where id = ?;`
        console.log("Query pre act: ", query, values)
        try {
            await connection.beginTransaction()

            if (keys.length) {

                const [result] = await connection.query(query, values)

                await connection.commit()
            }
        } catch (e) {
            console.log("Error al actualizar el usuario: ", e)
            await connection.rollback()
            return new Error("Fallo el servidor de manera inesperada al actualizar el usuario")
        }

        const [updatedUser] = await connection.query(
            "SELECT user, email FROM usuario WHERE id = ?;",
            [id]
        )

        return updatedUser
    }

    static generarToken(usuario) {
        const token = crypto.randomBytes(32).toString('hex')
        
        const expires = Date.now() + (3600 * 1000) // 3600 Equivale a una hora en segundos | x 1000 para poner los segundos en milisegundos (3.600.000)
        // console.log(`Entro generar token, usuario: ${usuario}, token: ${token} |TokenExp: ${expires} Token segs: ${Math.floor((expires - Date.now()) / 1000)}`)
        tokens.set(token, {usuario, expires} )
        // console.log(`Token en el dict: ${tokens.get(token)}`)
        return {
            access_token: token,
            token_type: "Bearer",
            expires_in: Math.floor((tokens.get(token).expires - Date.now() ) / 1000)
        }
        
    }

    static async verificarCredenciales(auth) {
        // Credencial codificada en base64
        const credentialbase64 = auth.split(" ")[1] // Divide "Basic dXN1YXJpbzpwYXNzMTIz" en "dXN1YXJpbzpwYXNzMTIz"
        // Credencials decodificada
        const credentials = Buffer.from(credentialbase64, 'base64').toString('utf-8') // Convierte "dXN1YXJpbzpwYXNzMTIz" en "usuario:contraseña"

        const [email, pass] = credentials.split(':')

        console.log(`Verficando Credenciales: ${email} | ${pass} | ${auth} | ${credentialbase64} | ${credentials} | ${Buffer.from(credentialbase64, 'base64').toString('utf-8')}`)
        try {
            const [query, queryStruc] = await connection.query(
                "SELECT user, email, password FROM usuario WHERE email=?",
                [email]
            )

            if (!query.length) return [false, null]

            console.log("Query result: ", query[0], " Hash ", query[0].password)

            const storedHash = query[0].password
            const validPassword = await bcrypt.compare(pass, storedHash)
            if (email === query[0].email && validPassword ) {

                return [true, query[0].user]

            } else {

                return [false, null]  
            }

        } catch (e) {

            console.error("Fallo el verificar Credenciales: ", e)
            return new Error("Ocurrio un error inesperado al verificar Credenciales")
        }
        
    }

    static verificarToken(token) {

        const data = tokens.get(token)
        console.log(`Token verificar: ${token}`)

        // tokens.forEach((item, key) => {
        //     console.log(key, item)
        // })
        if (!data) return {
            user: undefined,
            expired: false
        }

        if (Date.now() > data.expires) {
            tokens.delete(token)
            return {
                user: data.usuario,
                expired: true
            }
        }

        return {
            user: data.usuario,
            expired: false
        }
    }
}

// export function generarToken(usuario) {
//     const token = crypto.randomBytes(32).toString('hex')
    
//     const expires = Date.now() + (3600 * 1000) // 3600 Equivale a una hora en segundos | x 1000 para poner los segundos en milisegundos (3.600.000)
//     // console.log(`Entro generar token, usuario: ${usuario}, token: ${token}`)
//     tokens.set(token, {usuario, expires} )
//     // console.log(`Token en el dict: ${tokens.get(token)}`)
//     return {
//         access_token: token,
//         token_type: "Bearer",
//         expires_in: tokens.get(token).expires
//     }
    
// }

// export async function verificarCredenciales(auth) {
//     // Credencial codificada en base64
//     const credentialbase64 = auth.split(" ")[1] // Divide "Basic dXN1YXJpbzpwYXNzMTIz" en "dXN1YXJpbzpwYXNzMTIz"
//     // Credencials decodificada
//     const credentials = Buffer.from(credentialbase64, 'base64').toString('utf-8') // Convierte "dXN1YXJpbzpwYXNzMTIz" en "usuario:contraseña"

//     const [user, pass] = credentials.split(':')

//     console.log(`Verficando Credenciales: ${user} | ${pass}`)

//     const [query, queryStruc] = await connection.query(
//         "SELECT user, email, password FROM usuario WHERE email=?",
//         [user]
//     )
//     console.log("Query result: ", query[0], query[0].password)
//     if (user === query[0].email && pass === query[0].password ) {

//         return [true, query[0].user]

//     } else {

//         return [false, null]
        
//     }
// }

// export function verificarToken(token) {

//     const data = tokens.get(token)
//     console.log(`Token verificar: ${token}`)

//     // tokens.forEach((item, key) => {
//     //     console.log(key, item)
//     // })
//     if (!data) return {
//         user: undefined,
//         expired: false
//     }

//     if (Date.now() > data.expires) {
//         tokens.delete(token)
//         return {
//             user: data.usuario,
//             expired: true
//         }
//     }

//     return {
//         user: data.usuario,
//         expired: false
//     }
// }