const { Model, DataTypes, Sequelize } = require('sequelize')
const { USERS_TABLE } = require('./users.model')

const LOANS_TABLE = 'loans'

const LoansSchema = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
		type: DataTypes.INTEGER
	},
	type: {
		type: DataTypes.TINYINT,
		defaultValue: 1,
		allowNull: false
	},
	initialDate: {
		type: DataTypes.DATE,
		defaultValue: Sequelize.NOW,
		allowNull: false,
		field: 'initial_date'
	},
	initialMonth: {
		type: DataTypes.ENUM(['this', 'next']),
		defaultValue: 'this',
		allowNull: false,
		field: 'initial_month'
	},
	instalmentsInTotal: {
		type: DataTypes.TINYINT,
		allowNull: false,
		field: 'instalments_in_total'
	},
	payedInstalments: {
		type: DataTypes.TINYINT,
		defaultValue: 0,
		allowNull: false,
		field: 'payed_instalments'
	},
	debtorId: {
		allowNull: false,
		type: DataTypes.INTEGER,
		field: 'debtor_id'
	},
	status: {
		type: DataTypes.TINYINT,
		defaultValue: 1,
		allowNull: false
	},
	amount: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	registerDate: {
		field: 'register_date',
		type: DataTypes.DATE,
		defaultValue: Sequelize.NOW
	},
	last_update: {
		allowNull: false,
		type: DataTypes.DATE,
		defaultValue: Sequelize.NOW

	},
	payed: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		allowNull: false
	}
}

const LoansConstraintSchema = {
	fields: ['debtor_id'],
	type: 'foreign key',
	references: {
		table: USERS_TABLE,
		field: 'id'
	},
	onUpdate: 'cascade',
	onDelete: 'cascade'
}

class Loan extends Model {
	static associate(models) {
		this.hasMany(models.Instalment, {
			foreignKey: 'loanId',
			as: 'instalments'
		})
		this.hasMany(models.CosignerRel, {
			foreignKey: 'loanId',
			as: 'cosigners'
		})
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: LOANS_TABLE,
			modelName: "Loan",
			timestamps: false
		}
	}
}

module.exports = { Loan, LoansSchema, LoansConstraintSchema, LOANS_TABLE }