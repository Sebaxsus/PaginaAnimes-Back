// import { generarToken } from '../../Models/Auth/Map_Dict/auth.js'
import { AuthModel } from "../../Models/Auth/MySQL/auth.js"


export class authController {

    static async login (req, res) {
    
        const auth = req.headers.authorization
        console.log(auth)
        if (!auth || !auth.startsWith("Basic ")) {
            return res.status(401).send(
                "Credenciales invalidas"
            )
        }
        
        const user = await AuthModel.verificarCredenciales(auth)
        console.log("Datos devuelto por verificarCreden: ", user)
        if (user[0]) {

            const authorization = AuthModel.generarToken(user[1])

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