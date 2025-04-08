import zod from "zod"

const generoSchema = zod.object({
    genre: zod.array(
        zod.string({
            invalid_type_error: "El arreglo de generos debe ser de tipo texto",
            required_error: "El arreglo de generos no puede estar vacio"
        })
    ).nonempty({
        message: "Debe tener al menos un genero 😑"
    })
})

export function validateGenero (body) {
    return generoSchema.safeParse(body)
}

export function validatePartialGenero (body) {
    return generoSchema.partial().safeParse(body)
}