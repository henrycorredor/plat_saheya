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
    getUsers() {
        return new Promise((res, rej) => {
            this.db.query(`SELECT * FROM usuarios`, (error, data) => {
                if (error) rej(error)
                res(JSON.parse(JSON.stringify(data)))
            })
        })
    }
}

module.exports = MySqlClass