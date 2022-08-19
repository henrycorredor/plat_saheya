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

//field: godfather
//field: godson
//table: USERS_TABLE
const GodparentsConstraintSchema = (field, table) => {
	return {
		fields: [field],
		type: 'foreign key',
		references: {
			table: table,
			field: 'id'
		},
		onUpdate: 'cascade',
		onDelete: 'cascade'
	}
}

class Godparent extends Model {
	static associate(models) {
		//none to fill
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

module.exports = { Godparent, GodparentsSchema, GodparentsConstraintSchema, GODPARENTS_TABLE }