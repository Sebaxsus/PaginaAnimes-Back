import redis from "../Redis/redisClient.js"
import crypto from "node:crypto"
import bcrypt from "bcrypt"

// ---------------------------------------

// Redis
// Ahora se usa redis con su cliente

export class AuthModelR {

    static generarHashSessionId(id) {
        return crypto.createHash('sha256').update(id).digest('hex')
    }
    // Para evitar crear mas refresh tokens para el mismo usuario
    // Toca crear una nueva llave en redis que almacene el usuario y su refresh token
    static async verificarExistingToken({ id }) {
        const idHash = this.generarHashSessionId(id)
        const refreshToken = await redis.get(`session:${idHash}`)

        console.log("Entro a verificar Si existe token: ", refreshToken)

        if (refreshToken) {
            return {
                exist: true,
                refresh_token: refreshToken,
            }
        }

        return {
            exist: false,
            refresh_token: undefined,
        }
    }

    static async generarTokenRedis({ usuario, req }) {
        // Usuario es el nombre de usuario
        const accessToken = crypto.randomBytes(32).toString('hex')
        const refreshToken = crypto.randomBytes(32).toString('hex')
        const ip = req.ip
        const user_agent = req.headers['user-agent']
        const expiresInSeconds = 3600
        const refreshExpirationTime = 86400
        // En redis guardo los datos del token como Usuario, ip y user_agent como un string parseado con json -> es decir parseo el objeto a un string
        // Mantego la estructura llave: valor dentro del objecto para asegurar su nombre de llave
        await redis.set(`access:${accessToken}`, JSON.stringify({ usuario: usuario, ip: ip, user_agent: user_agent }), { expiration: { type: 'EX', value: expiresInSeconds } }) // 3600 segundos = 1hora
        await redis.set(`refresh:${refreshToken}`, JSON.stringify({ usuario: usuario, ip: ip, user_agent: user_agent }), { expiration: { type: 'EX', value: refreshExpirationTime } })

        // Creando un hash de la info de session
        const sessionHash = this.generarHashSessionId(`${usuario+ip}`)
        await redis.set(`session:${sessionHash}`, refreshToken)

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: "Bearer",
            expires_in: expiresInSeconds
        }
    }

    static async verificarTokenRedis({ token, req }) {
        // Como en redis guardo un objeto en string usando JSON.stringfy()
        // Tengo re parsearlo a un objeto con JSON.parse()
        const tokenString = await redis.get(`access:${token}`)
        console.log("Verificar token redis token:  ", token)

        if (!tokenString) {
            return {
                user: undefined,
                expired: true,
                missMatch: false,
            }
        }
        const { usuario, ip, user_agent } = JSON.parse(tokenString)

        // console.log("Verificar token redis: ", usuario, ip, user_agent, "\nreq: ", req.ip, req.headers['user-agent'], req.headers['user-agent'] === user_agent, toString(ip) === toString(req.ip))

        if (req.ip !== ip || req.headers['user-agent'] !== user_agent) {
            return {
                user: usuario,
                expired: false,
                missMatch: true,
            }
        }

        return {
            user: usuario,
            expired: false,
            missMatch: false,
        }
    }

    static async verificarRefreshTokenRedis({ token, req }) {

        const tokenString = await redis.get(`refresh:${token}`)
        console.log("Verificar Refreshtoken redis token:  ", token)
        // Verifico si existe al principio y antes de parsear un null
        if (!tokenString) return {
            user: undefined,
            expired: true,
            missMatch: false,
        }

        const { usuario, ip, user_agent } = JSON.parse(tokenString)
        console.log("VerificarRefreshRedis: ", token, "\nip: ", ip, "\nagent: ", user_agent)


        if (req.ip !== ip || req.headers['user-agent'] !== user_agent) {
            return {
                user: usuario,
                expired: false,
                missMatch: true,
            }
        }

        return {
            user: usuario,
            expired: false,
            missMatch: false,
        }
    }

    static async limpiarTokenRedis({ sessionId, refreshToken, accessToken }) {
        const sessionHash = this.generarHashSessionId(sessionId)
        const sessionString = await redis.get(`session:${sessionHash}`)
        const tokenString = await redis.get(`refresh:${refreshToken}`)

        if (accessToken !== undefined) {
            await redis.del(`access:${accessToken.split(" ")[1]}`)
        }

        if (!tokenString || !sessionString) {
            return new Error("Token o session Invalidas o Inexistentes")
        }

        await redis.del(`session:${sessionHash}`)
        await redis.del(`refresh:${refreshToken}`)

        return "Se cerro la session Correctamente!"
    }

    static async renovarTokenRedis({ refreshToken, accessToken }) {

        const tokenString = await redis.get(`refresh:${refreshToken}`)
        const oldAccessTokenString = accessToken === undefined ? null : await redis.get(`access:${accessToken}`)

        if (!tokenString) {
            return new Error("Refresh token inválido o expirado")
        }

        const { usuario, ip, user_agent } = JSON.parse(tokenString)

        // Generando un nuevo access token
        const newAccessToken = crypto.randomBytes(32).toString('hex')
        const accessExpires = 3600
        await redis.set(`access:${newAccessToken}`, JSON.stringify({ usuario: usuario, ip: ip, user_agent: user_agent }), { expiration: { type: "EX", value: accessExpires } })
        // accesstokens.set(newAccessToken, {usuario: oldAccessTokenData.usuario, expires: accessExpires})

        // Eliminando el accessToken antiguio si existe
        if (oldAccessTokenString) {
            console.log("Eliminando el antigio Token de: ", JSON.parse(oldAccessTokenString).usuario)
            await redis.del(`access:${accessToken}`)
        }

        return {
            access_token: newAccessToken,
            token_type: "Bearer", // Seria mejor guardar en refresh el tipo de token
            expires_in: accessExpires,
        }
    }

}