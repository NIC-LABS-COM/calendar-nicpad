const { Sequelize, DataTypes, Model } = require('sequelize')
const database = require('../db')

class Cargo extends Sequelize.Model {}

Cargo.init(
  {
    cargoId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    text: DataTypes.STRING
  },

  {
    sequelize: database,
    modelName: 'Cargo'
  }
)

module.exports = Cargo
