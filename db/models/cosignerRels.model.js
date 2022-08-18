const { Model, DataTypes } = require('sequelize')
const { LOANS_TABLE } = require('./loans.model')

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
		type: DataTypes.INTEGER,
		references: {
			model: LOANS_TABLE,
			key: 'id'
		},
		onUpdate: 'cascade',
		onDelete: 'set null'
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


class CosignerRel extends Model {
	static associations(models) {
		//completar
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

module.exports = { CosignerRel, CosignerRelsSchema, COSIGNERS_RELS_TABLE }