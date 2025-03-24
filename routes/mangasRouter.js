import { Router } from "express"
import { MangasController } from "../Controllers/Mangas/mangas.js"

const mangasRouter = Router()

mangasRouter.get('/', MangasController.getAll)

//Express puede utilizar rutas con Expresiones Regulares de manera Nativa
//Ej /*mangas/*

mangasRouter.get('/:id', MangasController.getById)

mangasRouter.post('/', MangasController.create)

//Usando el metodo HTTP PATCH para
//ACtualizar campos de un registro
//Actualizar un campo de una pelicula

mangasRouter.patch('/:id', MangasController.update)

//Delete

mangasRouter.delete('/:id', MangasController.delete)

export { mangasRouter }

