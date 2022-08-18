const { Model, DataTypes, Sequelize } = require('sequelize')

const USERS_TABLE = 'users'

const UserSchema = {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: DataTypes.INTEGER
    },
    names: {
        allowNull: false,
        type: DataTypes.STRING
    },
    lastnames: {
        allowNull: false,
        type: DataTypes.STRING
    },
    birthdate: {
        allowNull: true,
        type: DataTypes.DATE
    },
    idDocumentNumber: {
        allowNull: false,
        field: 'id_document_number',
        unique: true,
        type: DataTypes.BIGINT
    },
    joinDate: {
        allowNull: false,
        field: 'join_date',
        type: DataTypes.DATE
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'create_at',
        defaultValue: Sequelize.NOW
    },
    ppalPhone: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'ppal_phone',
        unique: true
    },
    email: {
        allowNull: true,
        type: DataTypes.STRING
    },
    rol: {
        allowNull: false,
        defaultValue: '1-normal',
        type: DataTypes.STRING
    },
    capital: {
        defaultValue: 0,
        type: DataTypes.INTEGER
    },
    pasive: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    capitalFrozen: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        field: 'capital_frozen'
    }
}

class User extends Model {
    static associations(models) {
        //completar
    }
    static config(sequelize) {
        return {
            sequelize,
            tableName: USERS_TABLE,
            modelName: "User",
            timestamps: false
        }
    }
}

module.exports = { User, UserSchema, USERS_TABLE }