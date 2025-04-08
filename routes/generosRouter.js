import { Router } from "express";
import { GeneroController } from "../Controllers/Generos/generos.js";

const generoRouter = Router()

generoRouter.get('/', GeneroController.getAll)

export { generoRouter }