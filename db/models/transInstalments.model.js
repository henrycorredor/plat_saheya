const { Model, DataTypes } = require('sequelize')
const { INSTALMENTS_TABLE } = require('./instalments.model')

const TRANS_INSTALMENTS_TABLE = 'trans_instalments'

const TransInstalmentsSchema = {
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
	instalmentId: {
		field: 'instalment_id',
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: INSTALMENTS_TABLE,
			key: 'id'
		},
		onUpdate: 'cascade',
		onDelete: 'set null'
	},
	totalAmount: {
		field: 'total_amount',
		allowNull: false,
		type: DataTypes.INTEGER
	},
	amount: {
		allowNull: false,
		type: DataTypes.INTEGER
	},
	interest: {
		allowNull: false,
		type: DataTypes.INTEGER
	},
	penalty: {
		allowNull: false,
		type: DataTypes.INTEGER,
		defaultValue: 0
	}
}

class TransInstalment extends Model {
	static associations(models) {
		this.belongsTo(models.Instalment, { as: 'instalment' })
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: TRANS_INSTALMENTS_TABLE,
			modelName: "TransInstalment",
			timestamps: false
		}
	}
}

module.exports = { TransInstalment, TransInstalmentsSchema, TRANS_INSTALMENTS_TABLE }