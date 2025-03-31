import zod from 'zod'

 const mangaSchema = zod.object({
        title: zod.string({
            invalid_type_error: "El Titulo debe ser una cadena de texto",
            required_error: "El Manga debe tener un Titulo"
        }),
        desc: zod.string({
            invalid_type_error: "La descripcion debe ser una cadena de texto",
            required_error: "El Manga debe tener una descripcion para poder saber de que se trata"
        }),
        img: zod.string({
            invalid_type_error: "La imagen debe ser una url en forma de cadena de texto!"
        }).url().default('./Eula.jpg'),
        genre: zod.array(zod.enum(["Drama", "Action", "Adventure", "Crime", "Sci-Fi"])).nonempty({
            message: "El manga debe tener al menos un genero! 😑"
        }),
    })

    export function validateManga(body) {
        return mangaSchema.safeParse(body)
    }

    //Validacion parcial para modifica solo un 
    //Campo

    export function validatePartialManga(body) {
        return mangaSchema.partial().safeParse(body)
    }