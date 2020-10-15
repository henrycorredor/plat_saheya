exports.exito = function (res, mensaje, estado) {
    let codigoEstado = estado || 200
    let mensajeRes = mensaje || ''
    console.log('se manda el mensaje: ',mensajeRes)
    //res.send(mensajeRes)
    res.send({
        body : mensajeRes,
        error: false,
        status: codigoEstado
    })
}

exports.error = function (res, mensaje, estado) {
    let estadoCodigo = estado || 500
    let estadoMensaje = mensaje || 'Error interno, contacte al administrador (o sea a Alejo Corredor)'
    res.status(estadoCodigo).send({
        body : estadoMensaje,
        error: true,
        status: estadoCodigo
    })
}

exports.entregarFicha = function (res, mensaje) {
    res.cookie('ficha', mensaje, { httpOnly: true, sameSite: 'Strict', secure: true })
    res.json({
        body:'ficha entregada',
        error:false
    })
}