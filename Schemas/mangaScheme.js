import zod from 'zod'

import { isValidImageUrl } from "../Utils/urlValidation.js"

const mangaSchema = zod.object({
    title: zod.string({
        invalid_type_error: "El Titulo debe ser una cadena de texto",
        required_error: "El Manga debe tener un Titulo"
    }),
    description: zod.string({
        invalid_type_error: "La descripcion debe ser una cadena de texto",
        required_error: "El Manga debe tener una descripcion para poder saber de que se trata"
    }),
    img: zod.string({
        invalid_type_error: "La imagen debe ser una url en forma de cadena de texto!"
    }).refine(isValidImageUrl, {
        message: "Debe ser una URL absoluta, una ruta relativa o una imagen base64 valida!",
    }).default('/Eula.jpg'),
    genre: zod.array(zod.number({
        invalid_type_error: "El arreglo debe contener numeros",
        required_error: "El arreglo debe tener al menos un genero (id)"
    }).positive({
        message: "El id del Genero debe ser positivo mayor que uno >(1)"
    })),
    chapter: zod.number({
        invalid_type_error: "Los capitulos deben ser un numero",
        required_error: "Debe tener al menos un capitulo"
    }).positive()
})
/*
genre: zod.array(zod.enum([
        'Action','Adventure','Comedy','Crime','Dark Fantasy','Drama',
        'Fantasy','Historical','Isekai','Mystery','Romance','Sci-Fi',
        'Slice of Life','Supernatural'
    ])).nonempty({
        message: "El manga debe tener al menos un genero! 😑"
    })
*/
export function validateManga(body) {
    return mangaSchema.safeParse(body)
}

//Validacion parcial para modifica solo un 
//Campo

export function validatePartialManga(body) {
    return mangaSchema.partial().safeParse(body)
}