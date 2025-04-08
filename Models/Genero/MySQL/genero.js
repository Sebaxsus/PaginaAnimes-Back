import mysql from "mysql2/promise"

const config = {
    host: "localhost",
    user: "Desarrollo",
    port: 3306,
    password: "desarrollo",
    database: "pagcontent"
}

const connection = await mysql.createConnection(config)

export class GeneroModel {

    static async getAll() {

        try {
            const [generos] = await connection.query(
                "SELECT id, name FROM genero;"
            )

            return generos
        } catch (e) {
            console.log("Fallo el obtener los generos: ", e)
            return new Error("Error Interno!")
        }

    }


}