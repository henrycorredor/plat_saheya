const mysql = require('mysql');
const config = require('../backend/config_serv')
const dbconf = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    charset : 'utf8mb4'
};

const coneccion = mysql.createConnection(dbconf)

coneccion.connect((err) => {
    if (err) {
        console.error('error en base de datos', err)
    } else {
        console.log('Base de datos conectada')
    }
})

module.exports = coneccion