const { Model, DataTypes } = require('sequelize')

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
		allowNull: false
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

//field: transaction_id, table: TRANSACTIONS_TABLE
//field: instalment_id, table: INSTALMENTS_TABLE
const TransInstalmentsConstraintSchema = (field, table) => {
	return {
		fields: [field],
		type: 'foreign key',
		references: {
			table,
			field: 'id'
		},
		onUpdate: 'cascade',
		onDelete: 'cascade'
	}
}

class TransInstalment extends Model {
	static associate(models) {
		this.belongsTo(models.Instalment, { as: 'instalment' })
		this.belongsTo(models.Transaction, { as: 'transaction' })
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

module.exports = { TransInstalment, TransInstalmentsSchema, TransInstalmentsConstraintSchema, TRANS_INSTALMENTS_TABLE }