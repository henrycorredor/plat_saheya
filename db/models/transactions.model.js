const { Model, DataTypes, Sequelize } = require('sequelize')

const TRANSACTIONS_TABLE = 'transactions'

const TransactionsSchema = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
		type: DataTypes.INTEGER
	},
	transactionDate: {
		field: 'transaction_date',
		type: DataTypes.DATE,
	},
	registrationDate: {
		field: 'registration_date',
		type: DataTypes.DATE,
		default: Sequelize.NOW
	},
	amount: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	issuer: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	issuerRol: {
		field: 'issuer_rol',
		type: DataTypes.STRING,
		defaultValue: '1-normal',
		allowNull: false
	},
	receiver: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: '1-waiting'
	},
	receipt: {
		type: DataTypes.STRING
	},
	comment: {
		type: DataTypes.TEXT
	}
}

class Transaction extends Model {
	static associations(models) {
		//completar
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: TRANSACTIONS_TABLE,
			modelName: "Transaction",
			timestamps: false
		}
	}
}

module.exports = { Transaction, TransactionsSchema, TRANSACTIONS_TABLE }