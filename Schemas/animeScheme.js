import zod from "zod"

import { isValidImageUrl } from "../Utils/urlValidation.js"


const animeScheme = zod.object({
        title: zod.string({
            invalid_type_error: "El titulo debe ser una cadena de texto!",
            required_error: "El anime debe tener un titulo!"
        }),
        description: zod.string({
            invalid_type_error: "La descripcion debe ser una cadena de texto!",
            required_error: "El anime debe tener una descripcion!"
        }),
        img: zod.string({
            invalid_type_error: "La imagen debe ser una url en forma de cadena de texto!"
        }).refine(isValidImageUrl, {
            message: "Debe ser una URL absoluta, una ruta relativa o una imagen base64 valida!",
        }).default('/CasualEula.png'),
        genre: zod.array(zod.number({
            invalid_type_error: "El arreglo debe contener numeros",
            required_error: "El arreglo debe tener al menos un genero (id)"
        }).positive({
            message: "El id del Genero debe ser positivo mayor que uno >(1)"
        }))
        ,chapter: zod.number({
            invalid_type_error: "Los capitulos deben ser un numero",
            required_error: "Debe tener al menos un capitulo"
        }).positive()
    }
)

/*
genre: zod.array(zod.enum([
            'Action','Adventure','Comedy','Crime','Dark Fantasy','Drama',
            'Fantasy','Historical','Isekai','Mystery','Romance','Sci-Fi',
            'Slice of Life','Supernatural'
        ])).nonempty({
            message: "El anime debe tener al menos un genero 😑"
        })
*/

export function validateAnime(body) {
    return animeScheme.safeParse(body)
}

export function validatePartialAnime(body) {
    return animeScheme.partial().safeParse(body)
}