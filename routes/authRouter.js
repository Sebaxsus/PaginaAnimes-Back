import { Router } from "express"
import { authController } from "../Controllers/Auth/authController.js"
import { authMiddleware } from "../Middleware/AuthMiddleware.js"

const authRouter = Router()

authRouter.post('/login', authController.login)

authRouter.post('/register', authController.register)

authRouter.get('/prueba', authMiddleware, authController.authPrueba)

export { authRouter }