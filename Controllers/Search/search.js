import { searchModel } from "../../Models/Search/MySQL/search.js";
import { validateSearch, validatePartialSearch } from "../../Schemas/searchScheme.js"

export class searchController {

    static async getAll(req, res) {
        console.log(`Peticion GET Search desde: ${req.header('origin')}, req.query: ${req.query.page}`)
        const result = validatePartialSearch(req.query)
        // console.log(result)
        if (result.error) {
            return res.status(400).json({
                message: "Error!, No se pudo consultar",
                error: JSON.parse(result.error.message)
            })
        }

        const {title, genre, limit = 6, page = 1} = req.query

        const limite = Math.ceil(parseInt(limit) / 2)

        const offset = (parseInt(page) - 1) * limite

        const data = await searchModel.getAll({title, genre, limit: limite, offset})

        if (data instanceof Error) {
            console.error(data)
            return res.status(500).json({message: "Error por causa desconocida " + data.message})
        }
       
        if (data.message) {
            return res.status(400).json(data)
        }

        const totalPages = Math.ceil(data[1] / parseInt(limit))

        return res.status(200).json({
            data: data[0],
            pagination: {
                currentPage: parseInt(page),
                pageSize: parseInt(limit),
                totalPages,
                totalRows: data[1],
                hasNext: parseInt(page) < totalPages,
                hasPrevius: parseInt(page) > 1,
            }
        })
    }

    static async getRecent(req, res) {
        console.log(`Peticion GET Recent Search desde: ${req.header('origin')}`)
        const { type } = req.params

        const data = await searchModel.getRecent({type})

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