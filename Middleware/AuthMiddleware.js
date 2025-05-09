import { verificarToken } from "../Models/Auth/MySQL/auth.js"

export async function authMiddleware(req, res, next) {
    try {
        const auth = req.headers.authorization

        console.log(`Entro authMiddleware, ${auth}, Auth_type: ${auth.split(" ")[0]}`)
        if (!auth || !auth.startsWith("Bearer")) {
            // Agregar un body
            return res.status(401).json(
                {
                    data: "Autorizacion rechazada por no haber token o Tipo de autorizacion no permitida"
                }
            )

        }
        // Convierte "Basic dXN1YXJpbzpwYXNzMTIz"
        // En "dXN1YXJpbzpwYXNzMTIz"
        const token = auth.split(" ")[1]

        const {user, expired } = verificarToken(token)

        console.log("Respuesta verificacion: ", user , expired)

        if (!user) {
            return res.status(401).json({
                error: "Invalid_User",
                message:"Ese Token no existe!"
            })
        }

        if (expired) {
            return res.status(401).json({
                error: "Token_Expired",
                message: "El token expiro!"
            })
        }

        // Crea un atributo en el request llamado user
        req.user = user

        next()
    } catch (e) {
        console.error("Fallo el middleware auth: ", e)
        res.status(500).send("Hubo un error inesperado en el servidor")
    }
    
}