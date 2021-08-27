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

    getData(table, conditions, column = "*") {
        let query = `SELECT ${column} FROM ${table}`
        query += (conditions) ? ` WHERE ${conditions}` : ''
        return this.doQuery(query)
    }

    upsert(table, data, conditions) {
        if (conditions) {
            return this.doQuery(`UPDATE ${table} SET ? WHERE ${conditions}`, data)
        } else {
            return this.doQuery(`INSERT INTO ${table} SET ?`, data)
        }
    }

    delete(table, condition) {
        return this.doQuery(`DELETE FROM ${table} WHERE ${condition}`)
    }
}

module.exports = MySqlClass