import { Router } from "express"
import { searchController } from "../Controllers/Search/search.js"

const searchRouter = Router()

searchRouter.get('/', searchController.getAll)

searchRouter.get('/:type', searchController.getRecent)

export { searchRouter }