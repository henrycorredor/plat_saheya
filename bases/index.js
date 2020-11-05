const config = require('./backend/config_serv')
const publico = require('./backend/publico/pub-network')
const api = require('./backend/api/api-network')
const path = require('path')
const error = require('./backend/utiles/manejadorError')

const express = require('express')
const aplicacion = express()

aplicacion.use(express.urlencoded({ extended: true }));
aplicacion.use(express.json());

aplicacion.set('views', path.join(__dirname,'vistas'))
aplicacion.set('view engine', 'pug')

aplicacion.use('/', publico)
aplicacion.use('/api', api)
aplicacion.use(error)

aplicacion.listen(config.serv_puerto, function () {
    console.log(`Escuchando puerto ${config.serv_puerto}`)
})