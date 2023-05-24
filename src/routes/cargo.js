const express = require('express')
const router = express.Router()
const cargoController = require('../controllers/cargoController')

router.get('/listCargo', async (req, res, next) => {
  cargoController.listCargo(req, res)
})

router.post('/createCargo', async (req, res, next) => {
  cargoController.createCargo(req, res)
})

router.post('/deleteCargo/:cargoId', async (req, res, next) => {
  cargoController.deleteCargo(req, res)
})

module.exports = router
