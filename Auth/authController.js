import { generarToken } from './authService.js'

export function login(req, res) {

    const auth = req.headers.authorization

    if (!auth || !auth.startsWith("Basic ")) {
        return res.statusCode(401)
    }
    // Credencial codificada en base64
    credentialbase64 = auth.split(" ")[1] // Divide "Basic dXN1YXJpbzpwYXNzMTIz" en "dXN1YXJpbzpwYXNzMTIz"
    // Credencials decodificada
    const credentials = Buffer.from(credentialbase64, 'base64').toString('utf-8') // Convierte "dXN1YXJpbzpwYXNzMTIz" en "usuario:contraseña"

    const [user, pass] = credentials
    // Aqui deberia consultar a la bd para obtener el usuario
    if (user === "test" && pass === "test") {
        const  { token, expires } = generarToken(user)

        return res.status(200).json(
            {
                access_toke: token,
                token_type: "Bearer",
                expires_in: (expires - Date.now()) / 1000
            }
        )

    } else {

        return res.sendStatus(401)
    }
}