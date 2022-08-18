const { Model, DataTypes, Sequelize } = require('sequelize')

const PASSWORDS_TABLE = 'passwords'

const PasswordsSchema = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
		type: DataTypes.INTEGER
	},
	userId: {
		allowNull: false,
		field: 'user_id',
		type: DataTypes.INTEGER
	},
	createdAt: {
		allowNull: false,
		type: DataTypes.DATE,
		field: 'created_at',
		defaultValue: Sequelize.NOW
	},
	password: {
		allowNull: false,
		type: DataTypes.INTEGER
	}
}

class Password extends Model {
	static associations(models) {
			//completar
	}
	static config(sequelize) {
			return {
					sequelize,
					tableName: PASSWORDS_TABLE,
					modelName: "Password",
					timestamps: false
			}
	}
}

module.exports = { Password, PasswordsSchema, PASSWORDS_TABLE }