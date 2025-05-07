//Api REST Con ECMAScript Module

import express, { json } from 'express'
import { mangasRouter } from './routes/mangasRouter.js'
import { animeRouter } from './routes/animesRouter.js'
import { corsMiddleware } from './Middleware/cors.js'
import { generoRouter } from './routes/generosRouter.js'
import { searchRouter } from './routes/searchRouter.js'
// Aqui va el import a la BD MySql

const PORT = process.env.PORT ?? 3000


const app = express()
app.disable('x-powered-by')

app.use(json())
app.use(corsMiddleware())

//Aqui le digo a expres que si me hacen una peticion
//al "/mangas", que redireccione toda la request
//a mangasRouter que es "./router/mangasRouter.js"

app.use('/mangas', mangasRouter)

// Escuchar la ruta "/animes"

app.use('/animes', animeRouter)

// Escuchar la ruta "/generos"

app.use('/generos', generoRouter)

//Escuchar la ruta "/search"

app.use('/search', searchRouter)

// En cuanto a los metodos Complejos me toca esperar a la base de Datos para sacar su id de ahi
// Recordar que los Metodos Complejos son PUT/PATCH/DELETE
// Y los metodos Normales son GET/HEAD/POST

app.use((req,res) => {
    res.status(404).json({message: 'No Existe Mi Sog, Not Found'})
})

app.listen(PORT, () => {
    console.log(`API REST | Escuchando en el puerto ${PORT} | Direccion http://localhost:${PORT}`)
})

// //Como configurar el Options (El que se encarga de dar aceso a metodos complejos
// //DEsde otros puertos direcciones CORS)

// app.options('/movies/:id', (req,res) => {
//     const origin = req.header('origin')
//     if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//         res.header('Access-Control-Allow-Origin', origin)
//         res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
//     }
//     res.send(200)
// })


// ------------------ Export para los test

export default app
