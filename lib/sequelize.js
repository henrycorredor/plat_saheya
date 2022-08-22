const { Sequelize } = require('sequelize')
const config = require('../config')
const setupModels = require('../db/models')

const USER = encodeURIComponent(config.dbUser)
const PASSWORD = encodeURIComponent(config.dbPassword)
const URI = `mysql://${USER}:${PASSWORD}@${config.dbUrl}:${config.dbPort}/${config.dbName}`

console.log(URI)

const sequalize = new Sequelize(URI,
	{
		dialect: 'mysql',
		logging: true
	}
)

setupModels(sequalize)

module.exports = sequalize