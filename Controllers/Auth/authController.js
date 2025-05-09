// import { generarToken } from '../../Models/Auth/Map_Dict/auth.js'
import { verificarCredenciales, generarToken } from "../../Models/Auth/MySQL/auth.js"


export class authController {

    static async login (req, res) {
    
        const auth = req.headers.authorization
        console.log(auth)
        if (!auth || !auth.startsWith("Basic ")) {
            return res.status(401).send(
                "Credenciales invalidas"
            )
        }
        
        const user = await verificarCredenciales(auth)
        console.log("Datos devuelto por verificarCreden: ", user)
        if (user[0]) {

            const authorization = generarToken(user[1])

            return res.status(200).send(
                authorization
            )
        }
    }

    static async register (req, res) {
        console.log("Body register: ", req.body)
        // generarToken()
    }

    static async authPrueba (req, res) {
        console.log("Entro prueba, Request: ", req.user)
        return res.status(201).json(
            {
                message: "El usuario existe la buena"
            }
        )
    }
}