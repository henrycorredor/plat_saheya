const express = require('express')
const router = express.Router()

const Services = require('../services/serv_users')

const services = new Services()

router.get('/', async (req, res, next) => {
    try {
        const users = await services.getAllUsers()
        res.json({
            message: 'Listed all users',
            status: '200',
            data: [...users]
        })
    } catch (error) {
        next(error)
    }
})

router.post('/', (req, res, next) => {
    res.json({ message: 'post users' })
})

router.get('/:id', (req, res, next) => {
    res.json({ message: `get users ${req.params.id}` })
})

router.put('/:id', (req, res, next) => {
    res.json({ message: `put users ${req.params.id}` })
})

module.exports = router