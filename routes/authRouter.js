import { Router } from "express"
import { authController } from "../Controllers/Auth/authController.js"
import { authMiddleware, userMiddleware } from "../Middleware/AuthMiddleware.js"

const authRouter = Router()

authRouter.post('/login', authController.login)

authRouter.post('/register', userMiddleware, authController.register)

authRouter.get('/refresh', authMiddleware, authController.authPrueba)

authRouter.post('/update', userMiddleware, authController.updateUser)

export { authRouter }