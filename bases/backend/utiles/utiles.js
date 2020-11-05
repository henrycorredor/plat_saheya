const jsonwebtoken = require("jsonwebtoken");
const { jwt_secreto } = require('../config_serv')

module.exports = function decodificarFicha(cabecera) {
    const ficha = cabecera.headers.cookie.replace("ficha=", "")
    return jsonwebtoken.decode(ficha, jwt_secreto);
}