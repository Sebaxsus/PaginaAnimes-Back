import request from "supertest"

import app from "../app.js"

import {jest} from "@jest/globals"

import * as mangaModel from "../Models/Manga/MySQL/manga.js"

jest.unstable_mockModule("../Models/Manga/MySQL/manga.js", () => ({
    ...jest.requireActual("../__mocks__/Models/Manga/MySQL/manga.js")
}))

/*
    Diferencia entre describe -> it y describe -> test

    describe -> it, Se usa cuando se hace test de BDD
    (Behavior Driven Developmet) es decir el test es de algo muy en especifico
    y el describe se ocupa de una parte de muchas

    decribe -> test, Se usa cuandos se hace test general
    es decir cuando dentro de ese describe voy a testear todo un endpoint 
    en lugar de un solo metodo de es endpoint

    Funcionalmente hablando it y test hacen lo mismo solo cambia su semantica
*/

describe("GET /mangas", () => {

    it("Deberia devolver todos los mangas", async () => {
        const res = await request(app).get("/mangas")
        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it("Deberia filtrar por genero", async () => {
        const res = await request(app).get("/mangas?genre=2")
        expect(res.statusCode).toBe(200)
    })

    it("Deberia retornar 404 si no existe el manga", async () => {
        const fakeID = "222ab2bd-0b17-4e4e-8037-194e6e53038b"
        const res = await request(app).get(`/mangas/${fakeID}`)
        expect(res.statusCode).toBe(404)
    })

})

describe("API /mangas", () => {
    test("GET /mangas", async () => {
        const res = await request(app).get("/mangas")
        expect(res.statusCode).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(typeof(res.body.pagination) === Object).toBe(true)
    })

    test("GET /mangas/:id", async () => {
        const res = await request(app).get("/mangas/mock-id")
        expect(res.statusCode).toBe(200)
        expect(res.body.title).toBe("Mock Manga")
    })

    test("POST /mangas", async () => {
        const newManga = {
            title: "Nuevo Manga",
            desc: "Un Manga Nuevo",
            img: "http://example.com/image.jpg",
            genre: [1,2],
        }

        const res = await request(app).post('/mangas').send(newManga)
        expect(res.statusCode).toBe(201)
        expect(res.body.title).toBe("Nuevo Manga")
    })

    test("PATCH /mangas/:id", async () => {
        const res = (await request(app).patch("/mangas/mock-id")).send({
            title: "Manga Actualizado",
        })

        expect(res.statusCode).toBe(200)
        expect(res.body.title).toBe("Manga Actualizado")
    })

    test("DELETE /mangas/:id", async () => {
        const res = await request(app).delete("/mangas/mock-id")
        expect(res.statusCode).toBe(204)
        expect(res.headers["Delete-Status"]).toMatch("200")
    })
})