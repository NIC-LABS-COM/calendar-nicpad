const express = require('express')
const router = express.Router()
const funcionariosController = require('../controllers/funcionariosController')
const Funcionario = require('../models/Funcionario')
const Tarefa = require('../models/Tarefa')
const Tipo = require('../models/Tipo')
const js2xmlparser = require('js2xmlparser')

// const { body, validationResult } = require('express-validator')

router.get('/listFuncionarios', async (req, res, next) => {
  funcionariosController.listFuncionarios(req, res)
})

// router.get('/funcionarios', async (req, res) => {
//   try {
//     // busca todos os funcionários
//     const funcionarios = await Funcionario.findAll()

//     // para cada funcionário, busca suas tarefas associadas
//     const tarefas = await Promise.all(
//       funcionarios.map(async funcionario => {
//         const tarefas = await funcionario.getTarefas()

//         // mapeia as tarefas para um formato que pode ser usado pelo calendário
//         return tarefas.map(tarefa => ({
//           icon: 'sap-icon://task',
//           dataInicio: tarefa.dataInicio,
//           dataFim: tarefa.dataFim,
//           nomeTarefa: tarefa.nomeTarefa,
//           descricao: tarefa.descricao
//         }))
//       })
//     )

//     // retorna os funcionários e suas tarefas associadas como um objeto
//     const data = funcionarios.map((funcionario, index) => ({
//       icon: 'sap-icon://employee',
//       id: funcionario.funcionarioId,
//       nome: funcionario.nome,
//       cargo: funcionario.cargo,
//       tarefas: tarefas[index]
//     }))

//     // converte o objeto em XML e envia a resposta
//     res.type('application/xml').send(js2xmlparser.parse('data', data))
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: 'Erro ao buscar funcionários' })
//   }

//   //   res.json(data)
//   // } catch (err) {
//   //   console.error(err)
//   //   res.status(500).json({ message: 'Erro ao buscar funcionários' })
//   // }
// })

router.post('/createFuncionario', async (req, res, next) => {
  funcionariosController.createFuncionario(req, res)
})

router.post('/deleteFuncionario/:funcionarioId', async (req, res, next) => {
  funcionariosController.deleteFuncionario(req, res)
})

router.delete(
  '/deleteEmployeeTask/:funcionarioId/tarefas',
  async (req, res) => {
    funcionariosController.deleteEmployeeTask(req, res)
  }
)

router.put('/updateFuncionario', async (req, res, next) => {
  funcionariosController.updateFuncionario(req, res)
})

module.exports = router
