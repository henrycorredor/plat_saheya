const bcrypt = require("bcrypt")
const baseDatos = require("../../baseDatos/bd-controlador")
const config = require("../config_serv")
const respuestas = require("../utiles/respuestas")
const jsonwebtoken = require("jsonwebtoken")
const error = require("../utiles/errores")

const secretojwt = config.jwt_secreto

function caso(caso, rol) {
  function mediador(pet, res, siguiente) {
    switch (caso) {
      case "identificarse":
        compararClave(pet, res, siguiente);
        break
      case "validarFicha":
        validarFicha(pet, siguiente, rol);
        break
      case 'verificarPermiso':
        break
      default:
        siguiente()
        break
    }
  }
  return mediador;
}

function generarFicha(pet, res) {
  baseDatos.traerDato("usuarios", "usuario_id, rol", `num_identificacion = '${pet.body.numIdentificacion}'`)
    .then((dato) => {
      const carga = { id: dato[0].usuario_id, rol: dato[0].rol };
      const ficha = jsonwebtoken.sign(carga, secretojwt);
      respuestas.entregarFicha(res, ficha);
    })
    .catch((err) => {
      respuestas.error(res, "Error en el servidor: " + err, 503);
    });
}

async function validarFicha(pet, siguiente, rol) {
  try {
    const cabecera = pet.headers.cookie || ""
    if (!cabecera || cabecera.indexOf("ficha=") === -1) {
      throw error("Por favor identifíquese.", 401)
    }
    const ficha = cabecera.replace("ficha=", "")
    if (jsonwebtoken.verify(ficha, secretojwt)) {
      if (!rol) {
        siguiente()
      } else {
        const usuario = jsonwebtoken.decode(ficha, secretojwt)
        if (usuario.rol === rol) {
          siguiente()
        } else {
          throw error("No autorizado.", 401)
        }
      }
    } else {
      throw error("Por favor identifíquese." + err, 401);
    }
  } catch (err) {
    siguiente(err)
  }
}

function compararClave(pet, res, siguiente) {
  baseDatos
    .retornarContrasenia(pet.body.numIdentificacion)
    .then((dato) => {
      if (dato[0] === undefined) {
        respuestas.error(
          res,
          "Por favor verifique su nombre de usuario y vuelva a intentarlo",
          401
        )
      } else {
        bcrypt.compare(pet.body.contrasenia, dato[0].contrasenia)
          .then(validado => {
            if (validado) {
              siguiente()
            } else {
              respuestas.error(res, 'Contraseña incorrecta', 401)
            }
          })
      }
    })
    .catch((err) => {
      throw error(
        `Error en el servidor, por favor reportele a Alejo Corredor lo siguiente: ${err}`,
        503
      )
    })
}

module.exports = { caso, generarFicha, validarFicha }
