const Tipo = require('../models/Tipo')
const Tarefa = require('../models/Tarefa')
const Funcionario = require('../models/Funcionario')

module.exports = {
  async listTipo(req, res) {
    try {
      const tipo = await Tipo.findAll(req.query)
      return res.json(tipo)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Listar os Tipos.' })
    }
  },

  async createTipo(req, res) {
    try {
      const tipo = await Tipo.create({
        text: req.body.text,
        type: req.body.type
      })
      await tipo.save()
      return res.status(201).json(tipo)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Criar Tipo.' })
    }
  },

  async deletetipo(req, res) {
    try {
      const tipo = await Tipo.findByPk(req.params.id)
      await tipo.destroy()
      return res.status(201).json({ msg: 'tipo deletado com sucesso.' })
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao deletar Tipo.' })
    }
  }
}
