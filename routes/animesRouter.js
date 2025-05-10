import { Router } from "express"
import { AnimeController } from "../Controllers/Animes/animes.js"
import { authMiddleware } from "../Middleware/AuthMiddleware.js"

const animeRouter = Router()

animeRouter.get('/', AnimeController.getAll)

animeRouter.get('/:id', AnimeController.getById)

animeRouter.post('/', authMiddleware, AnimeController.create)

animeRouter.patch('/:id', authMiddleware, AnimeController.update)

animeRouter.delete('/:id', authMiddleware, AnimeController.delete)

export { animeRouter }