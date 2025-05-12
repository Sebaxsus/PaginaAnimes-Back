import { Router } from "express"
import { authController } from "../Controllers/Auth/authController.js"
import { userMiddleware } from "../Middleware/Auth/AuthMiddleware.js"
import { refreshTokenMiddleware, refreshTokenRedisMiddleware } from "../Middleware/Auth/verifyRefreshToken.js"
import rateLimit from 'express-rate-limit'

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        error: "Too_Many_Request",
        message: "Demasiadas solicitudes, intente mas tarde",
        code: 429
    }
})

const authRouter = Router()

authRouter.post('/login', authController.login)

authRouter.post('/register', userMiddleware, authController.register)

// El refresh token funciona rotando los token de acceso (Creando uno nuevo y eliminando el anterior)
// Esto ya que es mas seguro ya que el token anterior se invalidad al crear otro nuevo
// Y permite que si roban el token y se refresca el token robado se invalida
// authRouter.post('/refresh',refreshLimiter, refreshTokenMiddleware, authController.renovarToken)
authRouter.post('/refresh',refreshLimiter, refreshTokenRedisMiddleware, authController.renovarToken)

authRouter.post('/update', userMiddleware, authController.updateUser)

// Como el login solo voy a necesitar los headers Authorization: refreshToken, user-name: user
// Header opcional Access-token: token
authRouter.get('/logout', authController.logout)

export { authRouter }