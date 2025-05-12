import { Router } from "express"
import { MangasController } from "../Controllers/Mangas/mangas.js"
import { accessTokenMiddleware, accessTokenRedisMiddleware } from "../Middleware/Auth/verifyAccessToken.js"

const mangasRouter = Router()

mangasRouter.get('/', MangasController.getAll)

//Express puede utilizar rutas con Expresiones Regulares de manera Nativa
//Ej /*mangas/*

mangasRouter.get('/:id', MangasController.getById)

mangasRouter.post('/', accessTokenRedisMiddleware, MangasController.create)

//Usando el metodo HTTP PATCH para
//ACtualizar campos de un registro
//Actualizar un campo de una pelicula

mangasRouter.patch('/:id', accessTokenRedisMiddleware, MangasController.update)

//Delete

mangasRouter.delete('/:id', accessTokenRedisMiddleware, MangasController.delete)

export { mangasRouter }

