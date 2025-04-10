import zod from "zod"

const searchScheme = zod.object({
    title: zod.string({
        invalid_type_error: "El titulo debe ser una cadena de texto"
    }),
    genre: zod.string({
        invalid_type_error: "El genero debe ser una cadena de texto"
    })
})

export function validateSearch(body) {
    return searchScheme.safeParse(body)
}

export function validatePartialSearch(body) {
    return searchScheme.partial().safeParse(body)
}