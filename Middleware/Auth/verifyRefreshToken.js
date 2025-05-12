import { AuthModel } from "../../Models/Auth/MySQL/auth.js"
import { AuthModelR } from "../../Models/Auth/Redis/auth.js"

export async function refreshTokenMiddleware(req, res, next) {
    // console.log(req.headers, req.headers['access-token'])
    // Para acceder a headers personalizados y que estan en string se usa ['header-name']
    try {
        // Los tokens se mandan por headers para garantizar la seguridad
        const refresh_token = req.headers.authorization.split(" ") // Arreglo de dos posiciones 0 = token_type, 1 = token
        const access_token = req.headers['access-token'].split(" ")
        
        const { user, expired, missMatch } = AuthModel.verificarRefreshToken({token: refresh_token[1], req: req})

        console.log("Respuesta veri: ", user, " ", expired, " ", missMatch)
        if (!user) {
            return res.status(401).json({
                error: "Invalid_User",
                message:"Ese Token no existe!",
                code: 401,
            })
        }
        // El codigo de respuesta mas especifico seria el
        // 498 - Invalid token, Pero este codigo no es oficial 
        // No esta en ningun documento de la RFC
        if (missMatch) {
            return res.status(401).json({
                error: "Token_Missmatch",
                message: "Error de seguridad | Vuelva a iniciar sesion",
                code: 401,
            })
        }

        if (expired) {
            return res.status(401).json({
                error: "Token_Expired",
                message: "El token expiro!",
                code: 401,
            })
        }

        // Crea un atributo en el request llamado user
        req.user = user

        next()
    } catch (e) {
        console.error("Fallo el middleware refresh: ", e)
        return res.status(500).json({
            error: "Fallo!",
            message: "Hubo un error inesperado en el servidor",
            code: 500,
        })
    }
}

export async function refreshTokenRedisMiddleware(req, res, next) {
    // console.log(req.headers, req.headers['access-token'])
    // Para acceder a headers personalizados y que estan en string se usa ['header-name']
    try {
        // Los tokens se mandan por headers para garantizar la seguridad
        const refresh_token = req.headers.authorization.split(" ") // Arreglo de dos posiciones 0 = token_type, 1 = token
        const access_token = req.headers['access-token'].split(" ")
        
        const { user, expired, missMatch } = await AuthModelR.verificarRefreshTokenRedis({token: refresh_token[1], req: req})

        console.log("Respuesta veriRedis: ", user, " ", expired, " ", missMatch)
        if (!user) {
            return res.status(401).json({
                error: "Invalid_User",
                message:"Ese Token no existe!",
                code: 401,
            })
        }
        // El codigo de respuesta mas especifico seria el
        // 498 - Invalid token, Pero este codigo no es oficial 
        // No esta en ningun documento de la RFC
        if (missMatch) {
            return res.status(401).json({
                error: "Token_Missmatch",
                message: "Error de seguridad | Vuelva a iniciar sesion",
                code: 401,
            })
        }

        if (expired) {
            return res.status(401).json({
                error: "Token_Expired",
                message: "El token expiro!",
                code: 401,
            })
        }

        // Crea un atributo en el request llamado user
        req.user = user

        next()
    } catch (e) {
        console.error("Fallo el middleware refresh: ", e)
        return res.status(500).json({
            error: "Fallo!",
            message: "Hubo un error inesperado en el servidor",
            code: 500,
        })
    }
}