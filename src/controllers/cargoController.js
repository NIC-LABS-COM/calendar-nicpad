const Cargo = require('../models/Cargo')

module.exports = {
  async listCargo(req, res) {
    try {
      const cargo = await Cargo.findAll(req.query)
      return res.json(cargo)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Listar os Cargos.' })
    }
  },

  async createCargo(req, res) {
    try {
      const cargo = await Cargo.create({
        text: req.body.text
      })
      await cargo.save()
      return res.status(201).json(cargo)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Criar Cargo.' })
    }
  },

  async deleteCargo(req, res) {
    try {
      const cargo = await Cargo.findByPk(req.params.cargoId)
      await cargo.destroy()
      return res.status(201).json({ msg: 'Cargo deletado com sucesso.' })
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao deletar Cargo.' })
    }
  }
}
