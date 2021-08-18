const mysql = require('mysql')
const config = require('../config')

class MySqlClass {
    constructor() {
        if (!this.db) {
            this.db = mysql.createConnection({
                user: config.dbUser,
                password: config.dbPassword,
                database: config.dbName,
                host: config.dbUrl
            })
        }
    }

    doQuery(query, data) {
        return new Promise((res, rej) => {
            this.db.query(query, data, (error, data) => {
                if (error) {
                    rej(error)
                } else {
                    res(JSON.parse(JSON.stringify(data)))
                }
            })
        })
    }

    getUser(conditions, row = "*") {
        let query = `SELECT ${row} FROM usuarios`
        query += (conditions) ? ` WHERE ${conditions}` : ''
        return this.doQuery(query)
    }

    createUser(data) {
        return this.doQuery("INSERT INTO usuarios SET ?", data)
    }

    editUser(id, data){
        return this.doQuery(`UPDATE usuarios SET ? WHERE id = ${id}`,data)
    }

    deleteUser(id){
        return this.doQuery(`DELETE FROM usuarios WHERE id = ${id}`)
    }
}

module.exports = MySqlClass