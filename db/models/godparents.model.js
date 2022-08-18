const { Model, DataTypes } = require('sequelize')

const GODPARENTS_TABLE = 'godparents'

const GodparentsSchema = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
		type: DataTypes.INTEGER
	},
	godfather: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	godson: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	active: {
		type: DataTypes.TINYINT,
		allowNull: false,
		defaultValue: 1
	}
}

class Godparent extends Model {
	static associations(models) {
		//completar
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: GODPARENTS_TABLE,
			modelName: "Godparent",
			timestamps: false
		}
	}
}

module.exports = { Godparent, GodparentsSchema, GODPARENTS_TABLE }