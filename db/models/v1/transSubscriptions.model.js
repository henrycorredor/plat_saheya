const { Model, DataTypes } = require('sequelize')
const { TRANSACTIONS_TABLE } = require('./transactions.model')

const TRANS_SUBSCRIPTIONS_TABLE = 'trans_subscriptions'

const TransSubscriptionsSchema = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
		type: DataTypes.INTEGER
	},
	transactionId: {
		field: 'transaction_id',
		type: DataTypes.INTEGER,
		allowNull: false
	},
	amount: {
		type: DataTypes.INTEGER,
		allowNull: false
	}
}

const TransSubscriptionsConstraintSchema = {
	fields: ['transaction_id'],
	type: 'foreign key',
	references: {
		table: TRANSACTIONS_TABLE,
		field: 'id'
	},
	onDelete: 'cascade',
	onUpdate: 'cascade'
}

class TransSubscription extends Model {
	static associate(models) {
		this.belongsTo(models.Transaction, { as: "transaction" })
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: TRANS_SUBSCRIPTIONS_TABLE,
			modelName: "TransSubscription",
			timestamps: false
		}
	}
}

module.exports = { TransSubscription, TransSubscriptionsConstraintSchema, TransSubscriptionsSchema, TRANS_SUBSCRIPTIONS_TABLE }