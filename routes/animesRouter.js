import { Router } from "express"
import { AnimeController } from "../Controllers/Animes/animes.js"

const animeRouter = Router()

animeRouter.get('/', AnimeController.getAll)

animeRouter.get('/:id', AnimeController.getById)

animeRouter.post('/', AnimeController.create)

animeRouter.patch('/:id', AnimeController.update)

animeRouter.delete('/:id', AnimeController.delete)

export { animeRouter }