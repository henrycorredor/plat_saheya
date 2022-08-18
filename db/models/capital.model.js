const { Model, DataTypes } = require('sequelize')

const CAPITAL_TABLE = 'capital'

const CapitalSchema = {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: DataTypes.INTEGER
    },
    amount: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    actualActive: {
        allowNull: false,
        field: 'actual_active',
        type: DataTypes.INTEGER
    },
    previousActive: {
        allowNull: false,
        field: 'previous_active',
        type: DataTypes.INTEGER
    },
    actualPasive: {
        allowNull: false,
        field: 'actual_pasive',
        type: DataTypes.INTEGER
    },
    previousPasive: {
        allowNull: false,
        field: 'previous_pasive',
        type: DataTypes.INTEGER
    },
    transactionId: {
        allowNull: false,
        field: 'transaction_id',
        type: DataTypes.INTEGER
    },
    holder: {
        allowNull: false,
        type: DataTypes.INTEGER
    }
}

class Capital extends Model {
    static assciate(){
        //completar
    }
    static config(sequelize){
        return {
            sequelize,
            tableName: CAPITAL_TABLE,
            modelName: 'Capital',
            timestamps: false
        }
    }
}

module.exports = { CAPITAL_TABLE, CapitalSchema, Capital }