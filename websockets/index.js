const express = require('express')
const aplicacion = express()
const servidor = require('http').Server(aplicacion)
const io = require('socket.io')(servidor)

aplicacion.use(express.static('publico'))

servidor.listen(3030, () => {
    console.log('servidor iniciado en 3030')
})

io.on('connection', function (zoquete) {
    console.log('nuevo cliente conectado')
    zoquete.emit('mensaje', 'bienllegao')
})

var contador = 0

setInterval(function () {
    io.emit('mensaje', `mensaje para todos lalala ${contador++}`)

}, 3000)