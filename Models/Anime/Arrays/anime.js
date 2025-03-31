import crypto from "node:crypto"
const ANIMES = [
    {title: "Hola",desc: "DESC",img: './CasualEula.png', id: crypto.randomUUID()}, {title: "Hola",desc: "DESC",img: './CasualEula.png', id: crypto.randomUUID()},
    {title: "Hola",desc: "DESC",img: './CasualEula.png', id: crypto.randomUUID()}, {title: "Hola",desc: "DESC",img: './CasualEula.png', id: crypto.randomUUID()},
    {title: "Hola",desc: "DESC",img: './CasualEula.png', id: crypto.randomUUID()}, {title: "Hola",desc: "DESC",img: './CasualEula.png', id: crypto.randomUUID()},
]

export class AnimeModel {

    static async getAll({title}) {
        
        if (title) {
            const animesFiltred = ANIMES.filter(anime => {if (anime.title.toLocaleLowerCase() === title.toLocaleLowerCase()) return anime;else return false})
            return animesFiltred
        }

        if (title === undefined) {
            return ANIMES
        }

        return new Error("Que paso? 🤨")

    }

    static async getById({ id }) {
        
        const anime = ANIMES.find(anime => anime.id === id)
        return anime

    }

    static async create({ data }) {
        const newAnime = {
            ...data
        }

        ANIMES.push(newAnime)

        return newAnime
    }

    static async update({ id, data}) {

        // const {
        //     title,
        //     desc,
        //     img,
        //     genre,
        // } = data

        const animeIndex = ANIMES.findIndex(anime => anime.id === id)

        if (animeIndex === -1) {
            return false
        }

        ANIMES[animeIndex] = {
            ...ANIMES[animeIndex],
            ...data
        }

        return ANIMES[animeIndex]

    }

    static async delete({id}) {

        const animeIndex = ANIMES.findIndex(anime => anime.id === id)

        if (animeIndex === -1) {
            return false
        }

        ANIMES.splice(animeIndex,1)

        return true
        
    }

}