const { Model, DataTypes, Sequelize } = require('sequelize')
const { USERS_TABLE } = require('./users.model')

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

const PasswordConstraintSchema = {
	fields: ['user_id'],
	type: 'foreign key',
	references: {
		table: USERS_TABLE,
		field: 'id'
	},
	onDelete: 'cascade',
	onUpdate: 'cascade'
}

class Password extends Model {
	static associate(models) {
		this.belongsTo(models.User)
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

module.exports = { Password, PasswordsSchema, PASSWORDS_TABLE, PasswordConstraintSchema }