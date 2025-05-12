import { AuthModel } from "../../Models/Auth/MySQL/auth.js"
import { AuthModelR } from "../../Models/Auth/Redis/auth.js"

export async function accessTokenMiddleware(req, res, next) {
    try {
        const auth = req.headers.authorization

        console.log(`Entro verifyAccessToken, ${auth}, Auth_type: ${auth.split(" ")[0]}`)
        if (!auth || !auth.startsWith("Bearer")) {
            // Agregar un body
            return res.status(401).json(
                {
                    error: "Invalid_auth_type",
                    message: "Autorizacion rechazada por no haber token o Tipo de autorizacion no permitida",
                    code: 401,
                }
            )

        }
        // Convierte "Basic dXN1YXJpbzpwYXNzMTIz"
        // En "dXN1YXJpbzpwYXNzMTIz"
        const token = auth.split(" ")[1]

        const {user, expired, missMatch } = AuthModel.verificarToken({token: token, req: req})

        console.log("Respuesta verificacion: ", user , expired, missMatch)

        if (!user) {
            return res.status(401).json({
                error: "Invalid_User",
                message:"Ese Token no existe!",
                code: 401,
            })
        }

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
        console.error("Fallo el middleware auth: ", e)
        return res.status(500).json({
            error: "Fallo!",
            message: "Hubo un error inesperado en el servidor",
            code: 500,
        })
    }
    
}

export async function accessTokenRedisMiddleware(req, res, next) {
    try {
        const auth = req.headers.authorization

        console.log(`Entro verifyAccessToken, ${auth}, Auth_type: ${auth.split(" ")[0]}`)
        if (!auth || !auth.startsWith("Bearer")) {
            // Agregar un body
            return res.status(401).json(
                {
                    error: "Invalid_auth_type",
                    message: "Autorizacion rechazada por no haber token o Tipo de autorizacion no permitida",
                    code: 401,
                }
            )

        }
        // Convierte "Basic dXN1YXJpbzpwYXNzMTIz"
        // En "dXN1YXJpbzpwYXNzMTIz"
        const token = auth.split(" ")[1]

        const {user, expired, missMatch } = await AuthModelR.verificarTokenRedis({token: token, req: req})

        console.log("Respuesta verificacion: ", user , expired, missMatch)

        if (!user) {
            return res.status(401).json({
                error: "Invalid_User",
                message:"Ese Token no existe!",
                code: 401,
            })
        }

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
        console.error("Fallo el middleware auth: ", e)
        return res.status(500).json({
            error: "Fallo!",
            message: "Hubo un error inesperado en el servidor",
            code: 500,
        })
    }
    
}