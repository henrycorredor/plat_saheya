const { writeFileSync } = require('fs');
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelizeErd = require('sequelize-erd');
const setupModels = require('./../../db/models/index');
//const { UserSchema } = require('./../../db/models/users.model');

(async function () {
  const sequelize = new Sequelize('mysql::memory:')
  //class User extends Model { }
  //User.init({ ...UserSchema }, { sequelize, modelName: 'User' })
  setupModels(sequelize)
  // User.init({
  //   id: {
  //     allowNull: false,
  //     autoIncrement: true,
  //     primaryKey: true,
  //     unique: true,
  //     type: DataTypes.INTEGER
  //   },
  //   names: {
  //     allowNull: false,
  //     type: DataTypes.STRING
  //   }
  // }, { sequelize, modelName: 'User' })

  const svg = await sequelizeErd({ source: sequelize }); // sequelizeErd() returns a Promise
  writeFileSync('./erd.svg', svg);

  // Writes erd.svg to local path with SVG file from your Sequelize models
})();