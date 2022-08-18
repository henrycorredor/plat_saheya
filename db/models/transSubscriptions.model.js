const { Model, DataTypes } = require('sequelize')

const TRANS_SUSCRIPTIONS_TABLE = 'transactions'

const TransSuscriptionsSchema = {
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

class TransSuscription extends Model {
	static associations(models) {
		//completar
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: TRANS_SUSCRIPTIONS_TABLE,
			modelName: "TransSuscription",
			timestamps: false
		}
	}
}

module.exports = { TransSuscription, TransSuscriptionsSchema, TRANS_SUSCRIPTIONS_TABLE }