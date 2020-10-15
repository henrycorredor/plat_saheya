exports.exito = function (pet, res, mensaje, estado) {
    let codigoEstado = estado || 200
    let mensajeEstado = mensaje || ''
    res.status(codigoEstado).send(mensajeEstado)
}

exports.error = function (pet, res, mensaje, estado) {
    let estadoCodigo = estado || 500
    let estadoMensaje = mensaje || 'Error interno, contacte al administrador (o sea a Alejo Corredor)'
    res.status(estadoCodigo).send({
        error: false,
        status: estadoCodigo,
        body: estadoMensaje
    })
}

exports.redireccion = function (pet, res, mensaje, estado) {
    //res.redirect('/')
    res.send('no papen')
    // const error = new Error('No puedes hacer esto');
    // error.statusCode = 401
    // throw error
}

exports.entregarFicha = function (pet, res, mensaje) {
    res.cookie('ficha', mensaje, { httpOnly: true, sameSite: 'Strict', secure: true })
    console.log(mensaje)
    res.json({ mensaje })
}