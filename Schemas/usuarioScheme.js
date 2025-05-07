import zod from "zod"

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
    contraseña: zod.string({
        invalid_type_error: "La contraseña debe ser tipo cadena de Texto",
        required_error: "La contraseña no puede estar vacia!"
    })
})


export function validateUsuario(body) {

    return usuarioScheme.safeParse(body)

}

export function validatePartialUsuario(body) {

    return usuarioScheme.partial().safeParse(body)

}