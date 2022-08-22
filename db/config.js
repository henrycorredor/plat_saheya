const config = require('../config/')

const USER = encodeURIComponent(config.dbUser)
const PASSWORD = encodeURIComponent(config.dbPassword)
const URI = `mysql://${USER}:${PASSWORD}@${config.dbUrl}:${config.dbPort}/${config.dbName}`


// development: {
// 	uri: URI,
// 	dialect: 'mysql'
// }
//console.log(URI)

module.exports = {
	development: {
		username: config.dbUser,
		password: config.dbPassword,
		database: config.dbName,
		host: config.dbUrl,
		port: config.dbPort,
		dialect: "mysql"
	},
	production: {
		uri: URI,
		dialect: 'mysql'
	}
}