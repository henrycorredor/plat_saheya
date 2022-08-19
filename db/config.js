const config = require('../config/')

const USER = encodeURIComponent(config.dbUser)
const PASSWORD = encodeURIComponent(config.dbPassword)
const URI = `mysql://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`

// development: {
// 	username: config.dbUser,
// 	password: config.dbPassword,
// 	database: config.dbName,
// 	host: config.dbHost,
// 	port: config.dbPort,
// 	dialect: "mysql"
// }

module.exports = {
	development: {
		uri: URI,
		dialect: 'mysql'
	},
	production: {
		uri: URI,
		dialect: 'mysql'
	}
}