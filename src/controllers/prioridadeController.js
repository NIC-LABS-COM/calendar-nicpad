const Prioridade = require('../models/Prioridade')

module.exports = {
  async listPrioridade(req, res) {
    try {
      const prioridade = await Prioridade.findAll(req.query)
      return res.json(prioridade)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Listar os Prioridades.' })
    }
  },

  async createPrioridade(req, res) {
    try {
      const prioridade = await Prioridade.create({
        text: req.body.text
      })
      await prioridade.save()
      return res.status(201).json(prioridade)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Criar Prioridade.' })
    }
  },

  async deletePrioridade(req, res) {
    try {
      const prioridade = await Prioridade.findByPk(req.params.prioridadeId)
      await prioridade.destroy()
      return res.status(201).json({ msg: 'Prioridade deletado com sucesso.' })
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao deletar Prioridade.' })
    }
  }
}
