module.exports = function (mensaje, codigo) {
    let e = new Error(mensaje);
    if (codigo) {
        e.statusCode = codigo;
    }
    console.log('esto se ejecuta')
    return e;
}