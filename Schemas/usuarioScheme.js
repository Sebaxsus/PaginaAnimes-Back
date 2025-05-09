import zod from "zod"

import { isValidEmail } from "../Utils/emailValidation.js"

/*
    No se si añadir al esquema el token 
    como un string base64 🤔🤔

    ------------------------------------

    En caso de hacerlo lo mejor seria usar siempre el partial
*/

const usuarioScheme = zod.object({
    user: zod.string({
        invalid_type_error: "El usuario debe ser tipo cadena de Texto",
        required_error: "El usuario no puede estar vacio!"
    }),
    email: zod.string({
        invalid_type_error: "El email debe ser una cadena de Texto",
        required_error: "El usuario debe tener un correo asociado y no puede estar vacio!"
    }).refine(isValidEmail, {
        message: "El email debe tener el formato direccion_email@dominio.com"
    }),
    password: zod.string({
        invalid_type_error: "La contraseña debe ser tipo cadena de Texto",
        required_error: "La contraseña no puede estar vacia!"
    }).min(3, "La contraseña debe tener minimo 3 caracteres!")
})


export function validateUsuario(body) {

    return usuarioScheme.safeParse(body)

}

export function validatePartialUsuario(body) {

    return usuarioScheme.partial().safeParse(body)

}