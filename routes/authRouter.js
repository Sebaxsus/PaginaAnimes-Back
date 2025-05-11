import { Router } from "express"
import { authController } from "../Controllers/Auth/authController.js"
import { authMiddleware, userMiddleware, refreshMiddleware } from "../Middleware/AuthMiddleware.js"

const authRouter = Router()

authRouter.post('/login', authController.login) // Toca validar la entrada que sea valido del esquema usuario

authRouter.post('/register', userMiddleware, authController.register)

// El refresh token funciona rotando los token de acceso (Creando uno nuevo y eliminando el anterior)
// Esto ya que es mas seguro ya que el token anterior se invalidad al crear otro nuevo
// Y permite que si roban el token y se refresca el token robado se invalida
authRouter.post('/refresh', refreshMiddleware, authController.renovarToken)

authRouter.post('/update', userMiddleware, authController.updateUser)

export { authRouter }