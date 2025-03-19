const express = require('express')
// Aqui va el import a la BD MySql
const crypto = require('node:crypto')
const cors = require('cors')
const zod = require('zod')

const lorem = "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis, natus necessitatibus, fugiat dolorem quidem fuga, maiores consequatur delectus sint aut unde impedit expedita debitis. Dignissimos nemo aliquid consequuntur vel cupiditate"

const PORT = process.env.PORT ?? 3000
const ACCEPTED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost/'
]

const MANGAS = [
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Crime"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Crime"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Crime"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Adventure"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action"] },
    { title: "Annata wa ii hito desu", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Sci-Fi"] }
]

const app = express()
app.disable('x-powered-by')

app.use(express.json())
app.use(cors({
    origin : (origin, callback) => {
        ACCEPTED_ORIGINS

        if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
            return callback(null, true)
        }

        if (!origin) {
            return callback(null, true)
        }

        return callback(new Error('No Permitido por CORS'))
    }
}))

app.get('/mangas', (req, res) => {
    console.log(`Peticion Get desde: `, req.header('origin'))
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }

    const { title } = req.query

    if (title) {
        const filtredMangas =  MANGAS.filter(manga => {if (manga.title.toLowerCase().includes(title.toLowerCase())) return manga;else{return false}})
        return res.json(filtredMangas)
    }

    res.json(MANGAS)
})

app.post('/mangas', (req, res) => {
    console.log(`Peticion POST desde: `, req.header('origin'))
    const mangaSchema = zod.object({
        title: zod.string({
            invalid_type_error: "El Titulo debe ser una cadena de texto",
            required_error: "El Manga debe tener un Titulo"
        }),
        desc: zod.string({
            invalid_type_error: "La descripcion debe ser una cadena de texto",
            required_error: "El Manga debe tener una descripcion para poder saber de que se trata"
        }),
        img: zod.string({
            invalid_type_error: "La imagen debe ser una url en forma de cadena de texto!"
        }).nonempty().default('./Eula.jpg'),
        genre: zod.array(zod.enum(["Drama", "Action", "Adventure", "Crime", "Sci-Fi"])),
    })

    function validateManga(body) {
        return mangaSchema.safeParse(body)
    }

    //Validacion parcial para modifica solo un 
    //Campo

    function validatePartialManga(body) {
        return mangaSchema.partial().safeParse(body)
    }
    const result = validateManga(req.body)

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message)})
    }

    const newManga = { // Actualmente como es solo el objeto de zod se podria hacer {const newManga = result.data}
        ...result.data
    }

    MANGAS.push(newManga)

    res.status(201).json({
        message: "Manga creado con Exito",
        code: 201,
        mangaSaved: [newManga]
    })
})

// En cuanto a los metodos Complejos me toca esperar a la base de Datos para sacar su id de ahi
// Recordar que los Metodos Complejos son PUT/PATCH/DELETE
// Y los metodos Normales son GET/HEAD/POST

app.use((req,res) => {
    res.status(404).json({message: 'No Existe Mi Sog, Not Found'})
})

app.listen(PORT, () => {
    console.log(`API REST | Escuchando en el puerto ${PORT} | Direccion http://localhost:${PORT}`)
})