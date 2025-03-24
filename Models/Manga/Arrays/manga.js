//Falta conectarlo con La Base de datos

const lorem = "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis, natus necessitatibus, fugiat dolorem quidem fuga, maiores consequatur delectus sint aut unde impedit expedita debitis. Dignissimos nemo aliquid consequuntur vel cupiditate"

const MANGAS = [
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Crime"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Crime"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Crime"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Adventure"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action"] },
    { title: "Manga", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action"] },
    { title: "Annata wa ii hito desu", desc: ["Bueno", lorem], img: './Eula.jpg', genre: ["Drama", "Action", "Sci-Fi"] }
]

export class MangaModel {

    static async getAll({title}) {

        if (title) {
            const filtredMangas =  MANGAS.filter(manga => {if (manga.title.toLowerCase().includes(title.toLowerCase())) return manga;else{return false}})
            return filtredMangas
        }

        return MANGAS

    }

    static async getById({id}) {

        const manga = MANGAS.find(manga => manga.id === id)
        return manga

    }

    static async create ({input}) {
        //Aqui no se esta teniendo en cuenta el id ya que la base de datos maneja las ID de manera
        //Indenpendiente
        const newManga = {
            ...input
        }

        MANGAS.push(newManga)

        return newManga

    }

    static async delete({id}) {

        const mangaIndex = MANGAS.findIndex(manga => manga.id === id)

        if (mangaIndex === -1) {
            return false
        }

        MANGAS.splice(mangaIndex, 1)
        return true

    }

    static async update({id, input}) {

        const mangaIndex = MANGAS.findIndex(manga => manga.id === id)

        if (mangaIndex === -1) {
            return false
        }

        MANGAS[mangaIndex] = {
            ...MANGAS[mangaIndex],
            ...input
        }

        return MANGAS[mangaIndex]
    }

}