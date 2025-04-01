import { AnimeModel } from "../../Models/Anime/MySQL/anime.js"
import { validateAnime, validatePartialAnime } from "../../Schemas/animeScheme.js"

export class AnimeController {

    static async getAll(req, res) {
        console.log(`Peticion GET desde: ${req.header('origin')}`)
        const { title } = req.query

        const anime = await AnimeModel.getAll({title})

        return res.json(anime)
    }

    static async getById(req, res) {
        console.log(`Peticion GET by Id desde: ${req.header('origin')}`)
        const { id } = req.params

        const anime = await AnimeModel.getById({id})

        if (anime) {
            return res.json(anime)
        }

        return res.status(404).json({message: "Error 404, Not Found"})
    }

    static async create(req, res) {
        console.log(`Peticion POST desde: ${req.header('origin')}`)
        const result = validateAnime(req.body)

        if (result.error) {
            return res.status(400).json({
                message: "Error!, No se pudo crear el Anime",
                error: JSON.parse(result.error.message)
            })
        }

        const newAnime = await AnimeModel.create({data: result.data})
        
        return res.status(201).json({
            message: "Se creo el anime con exito!",
            code: 201,
            animeSaved: [newAnime],
        })
    }

    static async update(req, res) {
        console.log(`Peticion PATCH desde: ${req.header('origin')}`)
        const { id } = req.params
        
        const result = validatePartialAnime(req.body)

        if (result.error) {
            return res.status(400).json({
                message: "Error!, No se pudo actualizar el Anime"
            })
        }

        const updatedAnime = await AnimeModel.update({id: id,data: result.data})

        if (typeof(updatedAnime) === "boolean") {
            return res.status(404).json({
                message: "Error!, No se encontro el anime",
                code: 404,
            })
        }

        return res.status(200).json({
            message: "El anime se actualizo con exito",
            code: 200,
            updatedAnime: [updatedAnime],
        })
    }

    static async delete(req, res) {
        
        console.log(`Peticion DELETE desde: ${req.header('origin')}`)

        const { id } = req.params

        const result = await AnimeModel.delete({id})

        if (result === false) {
            return res.status(404).json({
                message: "Error!, No se encontro el anime",
                code: 404
            })
        }

        // Aqui uso el codigo 204 No content Para indicar que el contenido se Elimino
        res.append('Delete-Status', `200 ${result} Anime Eliminado!`)
        return res.status(204).send("Anime Eliminado!")
    }

}