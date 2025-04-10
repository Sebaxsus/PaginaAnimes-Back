import { searchModel } from "../../Models/Search/MySQL/search.js";
import { validateSearch, validatePartialSearch } from "../../Schemas/searchScheme.js"

export class searchController {

    static async getAll(req, res) {
        console.log(`Peticion GET Search desde: ${req.header('origin')}`)
        const result = validatePartialSearch(req.query)
        // console.log(result)
        if (result.error) {
            return res.status(400).json({
                message: "Error!, No se pudo consultar",
                error: JSON.parse(result.error.message)
            })
        }

        const {title, genre} = req.query

        const data = await searchModel.getAll({title, genre})

        if (data instanceof Error) {
            console.error(data)
            return res.status(500).json({message: "Error por causa desconocida " + data.message})
        }
       
        if (data.message) {
            return res.status(400).json(data)
        }

        return res.status(200).json(data)
    }
}