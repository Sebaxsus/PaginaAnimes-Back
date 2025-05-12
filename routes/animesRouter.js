import { Router } from "express"
import { AnimeController } from "../Controllers/Animes/animes.js"
import { accessTokenMiddleware, accessTokenRedisMiddleware } from "../Middleware/Auth/verifyAccessToken.js"

const animeRouter = Router()

animeRouter.get('/', AnimeController.getAll)

animeRouter.get('/:id', AnimeController.getById)

animeRouter.post('/', accessTokenRedisMiddleware, AnimeController.create)

animeRouter.patch('/:id', accessTokenRedisMiddleware, AnimeController.update)

animeRouter.delete('/:id', accessTokenRedisMiddleware, AnimeController.delete)

export { animeRouter }