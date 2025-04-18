import { GeneroModel } from "../../Models/Genero/MySQL/genero.js";
import { validateGenero, validatePartialGenero } from "../../Schemas/generoScheme.js";

export class GeneroController {

    static async getAll(req, res) {
        console.log(`Peticion Get Generos desde: `, req.header('origin'))
        const generos = await GeneroModel.getAll()

        if (generos instanceof Error) {
            console.error(generos)
            return res.status(500).json({title:"Error!",message: "Error del Servidor " + generos.message})
        }

        return res.status(200).json(generos)
    }
}