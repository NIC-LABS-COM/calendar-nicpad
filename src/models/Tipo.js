const { Sequelize, DataTypes, Model } = require('sequelize')
const database = require('../db')
const Funcionario = require('./Funcionario')

class Tipo extends Sequelize.Model {}

Tipo.init(
  {
    tipoId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    text: DataTypes.STRING,
    type: DataTypes.STRING
    // icon: DataTypes.STRING
  },

  {
    sequelize: database,
    modelName: 'Tipo'
  }
)

module.exports = Tipo
