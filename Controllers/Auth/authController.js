// import { generarToken } from '../../Models/Auth/Map_Dict/auth.js'
import { AuthModel } from "../../Models/Auth/MySQL/auth.js"


export class authController {

    static async login (req, res) {
    
        const auth = req.headers.authorization
        // console.log(auth)
        if (!auth || !auth.startsWith("Basic ")) {
            return res.status(401).send(
                "Credenciales invalidas"
            )
        }
        
        const user = await AuthModel.verificarCredenciales(auth)
        // console.log("Datos devuelto por verificarCreden: ", user)
        if (user[0]) {

            const authorization = AuthModel.generarToken({usuario: user[1], req: req})

            return res.status(200).send(
                authorization
            )
        }
    }

    static async register (req, res) {
        console.log("Body register: ", req.body)
        
        const newUser = await AuthModel.crearUsuario({data: req.body})

        if (newUser instanceof Error) {
            return res.status(500).json({
                title: "Error",
                message: newUser.message,
                code: 500,
            })
        }

        return res.status(201).json({
            message: "Se creo el usuario con exito!",
            code: 201,
            userSaved: newUser.user,
        })
    }

    static async updateUser (req, res) {
        console.log("Body register: ", req.body)

        const updatedUser = await AuthModel.actualizarUsuario({data: req.body})

        if (updatedUser instanceof Error) {
            return res.status(500).json({
                title: "Error!",
                message: updatedUser.message,
                code: 500,
            })
        }

        return res.status(200).json({
            message: "Se actualizo el usuario",
            code: 200,
            updatedUser: updatedUser.user
        })
    }

    static async renovarToken (req, res) {
        // console.log("Headers refresh: ", req.headers, " User: ", req.user)
        // Cada header viene del siguient formato Bearer <token> | Notese que los separa un espacio en blanco
        const refresh_token = req.headers.authorization.split(" ") // Arreglo de dos posiciones | 0 = token_type, 1 = token
        const access_token = req.headers['access-token'].split(" ")
        const newToken = AuthModel.renovarToken({refreshToken: refresh_token[1], accessToken: access_token[1]})

        return res.status(200).send(
            newToken
        )
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