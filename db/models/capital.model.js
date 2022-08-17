const { Model, DataTypes, Sequelize } = require('sequelize')
/*
CREATE TABLE `capital` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `amount` int NOT NULL,
    `active_actual` int unsigned NOT NULL,
    `active_previous` int unsigned NOT NULL,
    `pasive_actual` int NOT NULL,
    `pasive_previous` int NOT NULL,
    `transaction_id` int unsigned NOT NULL,
    `holder` int NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  */

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
        type: DataTypes.INTEGER
    },
    previousActive: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    actualPasive: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    previousPasive: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    transactionId: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    holder: {
        allowNull: false,
        type: DataTypes.INTEGER
    }
}