const { Model, DataTypes } = require('sequelize')
const { LOANS_TABLE } = require('./loans.model')

const INSTALMENTS_TABLE = 'instalments'

const InstalmentsSchema = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
		type: DataTypes.INTEGER
	},
	loanId: {
		field: 'loan_id',
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: LOANS_TABLE,
			key: 'id'
		},
		onUpdate: 'cascade',
		onDelete: 'set null'
	},
	instalmentNumber: {
		field: 'instalment_number',
		type: DataTypes.TINYINT,
		allowNull: false
	},
	futureDebt: {
		field: 'future_debt',
		type: DataTypes.INTEGER,
		allowNull: false
	},
	validFrom: {
		field: 'valid_from',
		type: DataTypes.DATE,
		allowNull: false
	},
	validTill: {
		field: 'valid_till',
		type: DataTypes.DATE,
		allowNull: false
	},
	amount: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	interest: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	penalty: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	payedAmount: {
		field: 'payed_amount',
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	inDebt: {
		field: 'in_debt',
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	paymentDate: {
		field: 'payment_date',
		type: DataTypes.DATE,
		allowNull: false
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: '1-waiting'
	},
	transactionId: {
		field: 'transaction_id',
		type: DataTypes.INTEGER,
		defaultValue: null
	}
}

class Instalment extends Model {
	static associations(models) {
		this.hasOne(models.TransInstalment,{
			as: 'transaction',
			foreignKey: 'instalmentId'
		})
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: INSTALMENTS_TABLE,
			modelName: "Instalment",
			timestamps: false
		}
	}
}

module.exports = { Instalment, InstalmentsSchema, INSTALMENTS_TABLE }