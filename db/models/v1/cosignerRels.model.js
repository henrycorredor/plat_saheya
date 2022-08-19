const { Model, DataTypes } = require('sequelize')
const { LOANS_TABLE } = require('./loans.model')
const { USERS_TABLE } = require('./users.model')

const COSIGNERS_RELS_TABLE = 'cosigner_rels'

const CosignerRelsSchema = {
	id: {
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
		unique: true,
		type: DataTypes.INTEGER
	},
	loanId: {
		field: 'loan_id',
		allowNull: false,
		type: DataTypes.INTEGER
	},
	cosignerId: {
		field: 'cosigner_id',
		allowNull: false,
		type: DataTypes.INTEGER
	},
	guaranteedAmount: {
		field: 'guaranteed_amount',
		type: DataTypes.INTEGER,
		allowNull: false
	},
	guaranteedPayed: {
		field: 'guaranteed_payed',
		allowNull: false,
		defaultValue: 0,
		type: DataTypes.INTEGER
	},
	index: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	status: {
		type: DataTypes.TINYINT,
		allowNull: false,
		defaultValue: 1
	},
	lastUpdate: {
		field: 'last_update',
		type: DataTypes.DATE,
		defaultValue: null
	},
	rol: {
		type: DataTypes.TINYINT,
		defaultValue: 1,
		allowNull: false
	}
}

//field: loan_id, table: LOANS_TABLE
//field: cosigner_id, table: USERS_TABLE
const CosignerRelsConstraintSchema = (field, table) => {
	return {
		fields: [field],
		type: 'foreign key',
		references: {
			table: table,
			field: 'id'
		},
		onDelete: 'cascade',
		onUpdate: 'cascade'
	}
}

class CosignerRel extends Model {
	static associate(models) {
		this.belongsTo(models.User, { as: 'user' })
		this.belongsTo(models.Loan, { as: 'loan' })
	}
	static config(sequelize) {
		return {
			sequelize,
			tableName: COSIGNERS_RELS_TABLE,
			modelName: "CosignerRel",
			timestamps: false
		}
	}
}

module.exports = { CosignerRel, CosignerRelsSchema, CosignerRelsConstraintSchema, COSIGNERS_RELS_TABLE }