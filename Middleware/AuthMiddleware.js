import { AuthModel } from "../Models/Auth/MySQL/auth.js"
import { validateUsuario, validatePartialUsuario } from "../Schemas/usuarioScheme.js"

export async function authMiddleware(req, res, next) {
    try {
        const auth = req.headers.authorization

        console.log(`Entro authMiddleware, ${auth}, Auth_type: ${auth.split(" ")[0]}`)
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

        const {user, expired } = AuthModel.verificarToken(token)

        console.log("Respuesta verificacion: ", user , expired)

        if (!user) {
            return res.status(401).json({
                error: "Invalid_User",
                message:"Ese Token no existe!",
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

export async function userMiddleware(req, res, next) {
    console.log("Path? ", req.route.path)
    if (req.route.path === "/register") {
        try {
    
            const result = validateUsuario(req.body)
    
            if (result.error) {
                return res.status(400).json({
                    title:"Error!",
                    message: "Type Error!, No se pudo validar el Usuario",
                    code: 400,
                    error: JSON.parse(result.error.message),
                })
            }
    
            req.body = result.data
    
            next()
        } catch (e) {
            console.error("Fallo el middleware user: ", e)
            return res.status(500).json({
                title:"Falla!",
                message: "Hubo un error inesperado en el servidor",
                code: 500,
                error: "Fallo el server de manera inesperada",
            })
        }
    }

    if (req.route.path === "/update") {
        try {

            const result = validatePartialUsuario(req.body)

            if (result.error) {
                return res.status(400).json({
                    title:"Error!",
                    message: "Type Error!, No se pudo validar el Usuario",
                    code: 400,
                    error: JSON.parse(result.error.message),
                })
            }
    
            req.body = result.data
    
            next()
            
        } catch (e) {
            console.error("Fallo el middleware user: ", e)
            return res.status(500).json({
                title:"Falla!",
                message: "Hubo un error inesperado en el servidor",
                code: 500,
                error: "Fallo el server de manera inesperada",
            })
        }
    }
}