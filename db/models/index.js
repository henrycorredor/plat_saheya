//aqui va la conexión con el modelo funcional
const ACTUAL_VER = 'v1'
const setupModels = require(`./${ACTUAL_VER}/`)

module.exports = function (sequalize) {
	return setupModels(sequalize)
}