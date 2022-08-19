const { Model, DataTypes, Sequelize } = require('sequelize')
const { USERS_TABLE } = require('./users.model')

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
		allowNull: false,
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

//two cells need to be attached:
// receiver and issuer
const TransactionConstraintSchema = (cell) => {
	return {
		fields: [cell],
		type: 'foreign key',
		references: {
			table: USERS_TABLE,
			field: 'id'
		},
		onDelete: 'cascade',
		onUpdate: 'cascade'
	}
}

class Transaction extends Model {
	static associate(models) {
		this.hasOne(models.TransInstalment, {
			foreignKey: 'transactionId',
			as: 'instalment'
		})
		this.hasOne(models.TransSubscription, {
			foreignKey: 'transactionId',
			as: 'subscription'
		})
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

module.exports = { Transaction, TransactionsSchema, TransactionConstraintSchema, TRANSACTIONS_TABLE }