const { Sequelize, DataTypes, Model } = require('sequelize')
const database = require('../db')

class Prioridade extends Sequelize.Model {}

Prioridade.init(
  {
    prioridadeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    text: DataTypes.STRING
  },

  {
    sequelize: database,
    modelName: 'Prioridade'
  }
)

module.exports = Prioridade
