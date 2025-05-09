import zod from "zod"

const authScheme = zod.object(
    {
        auth_type: zod.string(
            {
                required_error: "El authorizatuion header debe enviar un tipo de autorizacion",
                invalid_type_error: "El tipo de autorizacion debe ser tipo string"
            }
        ),
        token: zod.string({
            required_error: "El authorization header debe enviar un token encryptado",
            invalid_type_error: "El token debe ser un string hexadecimal base64"
        }).base64(
            {
                message: "Dene enviar un string base64 en la authorizacion"
            }
        )
    }
)

export function validateAuth(body) {
    return authScheme.safeParse(body)
}