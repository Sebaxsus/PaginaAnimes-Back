//import { MangaModel } from "../../Models/Manga/Arrays/manga.js"
import { validateManga, validatePartialManga } from "../../Schemas/mangaScheme.js"
import { MangaModel } from "../../Models/Manga/MySQL/manga.js"

//El MangaController es el que recive la Request y decide que Responde
//Es decir decide que es lo que va a renderziar

export class MangasController {

    static async getAll (req, res) {
        console.log(`Peticion Get desde: `, req.header('origin'))
        // Desestructurando el objeto req.query
        const { title, genre } = req.query
        const mangas = await MangaModel.getAll({ genre, title })

        res.json(mangas)
    }

    static async getById (req, res) {
        console.log(`Peticion GetById desde: `, req.header('origin'))
        //el '/:id' es un paramatro del endpoint (URL) y el :id es parte de Path-To-Regexp de Express
        const { id } = req.params // esto es lo mismo que const id = req.params.id

        const manga = await MangaModel.getById({id})
        //Si manga es distinto a null entonces devuelve manga
        if (manga) return res.json(manga)

        res.status(404).json({ message: "Error 404, Not Found" })
    }

    static async create (req, res) {
        console.log(`Peticion POST desde: `, req.header('origin'), " Body: ", req.body)
        //Usando ZOD para manejar las entradas y validarlas
        const result = validateManga(req.body)

        if (result.error) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }

        const newManga = await MangaModel.create({ input: result.data })

        res.status(201).json({
            message: "Manga Creado con Exito",
            code: 201,
            mangaSaved: [newManga],
        })

    }

    static async update (req, res) {
        console.log(`Peticion PATCH desde: `, req.header('origin'), " Body: ", req.body)
        const result = validatePartialManga(req.body)

        if (!result.success) {
            return res.status(404).json({ error: JSON.parse(result.error.message) })
        }

        const { id } = req.params

        const updateManga = await MangaModel.update({ id: id,input: result.data })

        if (typeof(updateManga) === "boolean") {
            return res.status(404).json({ message: "No se encontre el Manga con ese Id" })
        }

        return res.json(updateManga)

    }

    static async delete (req, res) {
        console.log(`Peticion DELETE desde: `, req.header('origin'), " Body: ", req.body)
        const { id } = req.params

        const result = await MangaModel.delete({ id: id })

        if (result === false) {
            res.status(404).json({ message: "No se encontro el Manga con ese Id" })
        }

        return res.json({ message: "Manga Deleted" })

    }

}