// import { generarToken } from '../../Models/Auth/Map_Dict/auth.js'
import { AuthModel } from "../../Models/Auth/MySQL/auth.js"
import { AuthModelR } from "../../Models/Auth/Redis/auth.js"


export class authController {

    static async login (req, res) {
    
        const auth = req.headers.authorization
        // console.log(auth)
        if (!auth || !auth.startsWith("Basic ")) {
            return res.status(401).send(
                "Credenciales invalidas"
            )
        }
        // Devuelve un arregle de dos posiciones 
        // [0] => bool | Referenciando si es un usuario en la BD o no
        // [1] => objeto | con los siguientes atribs (user, email, password)
        const user = await AuthModel.verificarCredenciales(auth)
        // console.log("Datos devuelto por verificarCreden: ", user)
        if (user[0]) {
            // Devuelve un objeto con los atribs { exist, refresh_token }
            const refreshTokenExist = await AuthModelR.verificarExistingToken({id: `${user[1].user+req.ip}`})
            // En caso de que vuelva a logear no creara otro refreshToken pero access si, No elimina el token anterior
            const authorization = refreshTokenExist.exist 
                ? 
                await AuthModelR.renovarTokenRedis({refreshToken: refreshTokenExist.refresh_token, accessToken: null}) 
                : 
                await AuthModelR.generarTokenRedis({usuario: user[1].user, req: req})

            if (authorization instanceof Error) {
                return res.status(500).json({
                    title:"Error!",
                    message: authorization.message,
                    code: 500,
                })
            } 

            return res.status(200).send(
                authorization
            )
    
        }
    }

    static async logout (req, res) {
        const token = req.headers.authorization
        const user = req.headers['user-name']
        const accessToken = req.headers['access-token'] // Cuando no se manda el header accessToken es undefined

        console.log(accessToken, "\n", user)

        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).send(
                "Token Invalido!"
            )
        }

        const resultLogout = await AuthModelR.limpiarTokenRedis({sessionId: `${user+req.ip}`, refreshToken: token.split(" ")[1], accessToken: accessToken})

        if (resultLogout instanceof Error) {
            return res.status(401).json({
                title:"Error!",
                message: resultLogout.message,
                code:401,
            })
        }

        return res.status(200).json({
            title: "Completado",
            message: resultLogout,
            code: 200,
        })
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
        const newToken = await AuthModelR.renovarTokenRedis({refreshToken: refresh_token[1], accessToken: access_token[1], ip: req.ip, user_agent: req.headers['user-agent']})

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