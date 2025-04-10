import { Router } from "express"
import { searchController } from "../Controllers/Search/search.js"

const searchRouter = Router()

searchRouter.get('/', searchController.getAll)

export { searchRouter }