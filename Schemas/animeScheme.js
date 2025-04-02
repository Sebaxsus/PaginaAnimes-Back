import zod from "zod"

const animeScheme = zod.object({
        title: zod.string({
            invalid_type_error: "El titulo debe ser una cadena de texto!",
            required_error: "El anime debe tener un titulo!"
        }),
        desc: zod.string({
            invalid_type_error: "La descripcion debe ser una cadena de texto!",
            required_error: "El anime debe tener una descripcion!"
        }),
        img: zod.string({
            invalid_type_error: "La imagen debe ser una url en forma de cadena de texto!"
        }).url().default('./CasualEula.png'),
        genre: zod.array(zod.enum([
            'Action','Adventure','Comedy','Crime','Dark Fantasy','Drama',
            'Fantasy','Historical','Isekai','Mystery','Romance','Sci-Fi',
            'Slice of Life','Supernatural'
        ])).nonempty({
            message: "El anime debe tener al menos un genero 😑"
        }),
    }
)

export function validateAnime(body) {
    return animeScheme.safeParse(body)
}

export function validatePartialAnime(body) {
    return animeScheme.partial().safeParse(body)
}