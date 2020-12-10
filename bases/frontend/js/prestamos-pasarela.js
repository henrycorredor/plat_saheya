const formulario = document.getElementsByTagName('form')[0]
const rotulo = document.getElementById('form_aviso')
const bot_solicitar = document.getElementById('bot_solicitar')
const rotulo_coodeudor = document.getElementById('coodeduor_rotulo')
const pasarela_paso_2 = document.getElementById('form_pasarela_2')
const prestamo = {
    monto: 0,
    fecha_inicial: '',
    monto_respaldado: 0,
    maximo_permitido: Math.ceil((mi_capital * (procent_capital_permitido / 100)) - en_deuda),
    cuotas: 0,
    coodeudores: []
}

let estado = 1
let aval_en_proceso = 0
/*
ESTADOS DE LA PASARELA
1 - se ingresa el monto, si supera el permitido, pasa al estado 2, si no, pasa a estado 3
2 - se verifica un coodeudor, si no es suficiente, se verifican multiples coodeudores y pasa a 3
3 - los datos son integros y se puede entregar la solicitud
*/

formulario.addEventListener('submit', evento => {
    evento.preventDefault()
})

const rotuloTextoOriginal = rotulo.innerText

document.getElementById('monto').addEventListener('input', evento => {
    prestamo.monto = evento.target.value
    if (prestamo.monto > prestamo.maximo_permitido) {
        prestamo.monto_respaldado = Math.ceil(prestamo.monto - prestamo.maximo_permitido)
        bot_solicitar.disabled = true
        rotulo.innerText = `Su solicitud excede por $${agregarPuntosCentenas(prestamo.monto_respaldado)} el monto autorizado. Puede invitar un coodeudor para que respalde su deuda.`
        pasarela_paso_2.style.display = 'block'
        estado = 2
    } else {
        prestamo.monto_respaldado = 0
        rotulo.innerText = rotuloTextoOriginal
        bot_solicitar.disabled = false
        pasarela_paso_2.style.display = 'none'
        estado = 4
    }
})

document.getElementById('cuotas').addEventListener('input', e => {
    prestamo.cuotas = e.target.value
})

document.getElementById('fecha_inicial').addEventListener('input', e => {
    prestamo.fecha_inicial = e.target.value
})

document.getElementById('bot_revisar').addEventListener('click', async e => {
    rotulo_coodeudor.style.display = 'block'
    rotulo_coodeudor.innerText = 'Espere un momento por favor...'
    try {
        const datos = await verificarCedula(document.getElementById('input_cand_coodeudor').value)
        if (datos.existe) {
            procesar_coodeudores(datos)
        } else {
            rotulo_coodeudor.innerText = datos.mensaje
        }
    } catch (error) {
        let mensaje = (!error.mensaje) ? 'Ha habido un error en el sistema, por favor reporte a Alejo.' : error.mensaje
        document.getElementById('coodeduor_rotulo').innerText = mensaje
        e.target.disabled = true
    }
})

function procesar_coodeudores(datos) {
    rotulo_coodeudor.style.display = 'block'
    if (parseInt(datos.capital_libre) === 0) {
        rotulo_coodeudor.innerText = `${datos.nombre} no tiene cupo disponible. Por favor solicite soporte a otro usuario.`
        input_cand_coodeudor.value = ''
    } else if (datos.capital_libre >= prestamo.monto_respaldado && aval_en_proceso === 0) {
        rotulo_coodeudor.innerText = `El cupo de ${datos.nombre} es suficiente para respaldar su crédito. ¿Confirma que desea invitarlo como coodeudor?`
        const aceptar = generarDOM('a', { innerText: 'Si' }, pasarela_paso_2)
        const cancelar = generarDOM('a', { innerText: 'No' }, pasarela_paso_2)
        aceptar.addEventListener('click', e => {
            e.preventDefault()
            prestamo.coodeudores.push({
                nombre: datos.nombre,
                cedula: input_cand_coodeudor.value,
                monto: prestamo.monto_respaldado
            })
            pasarela_paso_2.style.display = 'none'
            rotulo.innerText = `Su solicitud de préstamo es de ${prestamo.monto}, con un monto avalado por ${prestamo.coodeudores[0].nombre} por la suma de ${prestamo.coodeudores[0].monto}. Puede proceder con la solicitud.`
            bot_solicitar.disabled = false
        })
        cancelar.addEventListener('click', e => {
            e.preventDefault()
            rotulo_coodeudor.innerText = 'Por favor inserte un número de cédula.'
            input_cand_coodeudor.value = ''
            aceptar.remove()
            e.target.remove()
        })
    } else {
        if (prestamo.monto_respaldado - aval_en_proceso > datos.capital_libre) {
            rotulo_coodeudor.innerText = `${datos.nombre} solo puede avalar ${agregarPuntosCentenas(datos.capital_libre)}. ¿Desea agregarlo a la lista de coodeudores y seguir invitando coodeudores?`
            const aceptar = generarDOM('a', { innerText: 'Si' }, pasarela_paso_2)
            const cancelar = generarDOM('a', { innerText: 'No' }, pasarela_paso_2)
            aceptar.addEventListener('click', e => {
                e.preventDefault()
                prestamo.coodeudores.push({
                    nombre: datos.nombre,
                    cedula: input_cand_coodeudor.value,
                    monto: datos.capital_libre
                })
                aval_en_proceso += parceInt(datos.capital_libre)
                rotulo_coodeudor.innerText = 'Por favor inserte el número de cédula del siguiente coodeudor.'
                e.target.remove()
                cancelar.remove()
            })
            cancelar.addEventListener('click', e => {
                e.preventDefault()
                rotulo_coodeudor.innerText = 'Por favor inserte un número de cédula.'
                input_cand_coodeudor.value = ''
                aceptar.remove()
                e.target.remove()
            })
        } else {
            rotulo_coodeudor.innerText = `${datos.nombre} puede avalar ${agregarPuntosCentenas(prestamo.monto_respaldado - aval_en_proceso)}. Una vez lo agregue a la lista de coodeudores puede proceder con la solicitud. ¿Desea agregarlo?`
            const aceptar = generarDOM('a', { innerText: 'Si' }, pasarela_paso_2)
            const cancelar = generarDOM('a', { innerText: 'No' }, pasarela_paso_2)
            aceptar.addEventListener('click', e => {
                e.preventDefault()
                prestamo.coodeudores.push({
                    nombre: datos.nombre,
                    cedula: input_cand_coodeudor.value,
                    monto: prestamo.monto_respaldado - aval_en_proceso
                })
                aval_en_proceso += parceInt(datos.capital_libre)
                pasarela_paso_2.style.display = 'none'
                bot_solicitar.disabled = false
            })
            cancelar.addEventListener('click', e => {
                e.preventDefault()
                rotulo_coodeudor.innerText = 'Por favor inserte un número de cédula.'
                input_cand_coodeudor.value = ''
                aceptar.remove()
                e.target.remove()
            })
        }
    }
}

function verificarCedula(numero_cedula) {
    return new Promise((resuelto, rechazado) => {
        fetch(`api/verificar_coodeudor?num_identificacion=${numero_cedula}`)
            .then(async res => {
                if (res.ok) {
                    const dato = await res.json()
                    resuelto(dato.body)
                } else {
                    rechazado(res)
                }
            }).catch(e => {
                rechazado(e)
            })
    })
}

function producirTablaCoodeudores(datos) {
    const contenedor = document.getElementById('tabla_coodeudores')
    contenedor.innerHTML = ''
    if (datos.length > 0) {
        contenedor.style.display = 'block'
        const tabla = generarDOM('table', '', contenedor)
        const thead = generarDOM('thead', '', tabla)
        generarDOM('th', { innerText: 'Nombre' }, thead)
        generarDOM('th', { innerText: 'Monto avalado' }, thead)
        const tbody = generarDOM('tbody', '', tabla)
        datos.forEach(usuario => {
            const tr = generarDOM('tr', '', tbody)
            generarDOM('td', { innerText: usuario.nombre }, tr)
            generarDOM('td', { innerText: usuario.monto }, tr)
        })
    } else {
        contenedor.style.display = 'none'
    }
}

//bot_solicitar.addEventListener('click', async e => {
async function procesar() {
    switch (estado) {
        case 1:
            if (prestamo.monto === '' || prestamo.monto === '0') {
                rotulo.innerText = 'Por favor digite un monto.'
                return
            }

            if (prestamo.cuotas === '' || prestamo.cuotas === '0') {
                rotulo.innerText = 'Por favor selecciones el número de cuotas.'
                return
            }

            if (prestamo.fecha_inicial === '') {
                rotulo.innerText = 'Por favor seleccione una fecha.'
                return
            }

            if (prestamo.monto_respaldado > 0) {
                document.getElementById('form_pasarela_1').style.display = 'none'
                e.target.value = 'Verificar cédula'
                estado = 2
            } else {
                aplicarPrestamo()
            }
            break
        case 2:
            const datos2 = await verificarCedula(document.getElementById('cood_cedula_1').value)
            if (datos2.existe) {
                if (parseInt(datos2.capital_libre) === 0) {
                    rotulo.innerText = `${datos2.nombre} no tiene cupo disponible. Por favor solicite soporte a otro usuario.`
                } else if (datos2.capital_libre >= prestamo.monto_respaldado) {
                    prestamo.coodeudores.push({
                        nombre: datos2.nombre,
                        cedula: document.getElementById('cood_cedula_1').value,
                        monto: prestamo.monto_respaldado
                    })
                    rotulo.innerText = `${datos2.nombre} está en capacidad de avalar ${agregarPuntosCentenas(prestamo.monto_respaldado)}. Puede proceder con la solicitud.`
                    e.target.value = 'Solicitar'
                    estado = 4
                } else {
                    rotulo.innerText = `El saldo libre de ${datos2.nombre} es de ${agregarPuntosCentenas(datos2.capital_libre)}. Puede invitar a otro coodeudor para avalar el monto restante de ${agregarPuntosCentenas(prestamo.monto - datos2.capital_libre)}`
                    prestamo.coodeudores.push({
                        nombre: datos2.nombre,
                        cedula: document.getElementById('cood_cedula_1').value,
                        monto: datos2.capital_libre
                    })
                    e.target.value = 'Aceptar y agregar otro coodeudor'
                    estado = 3
                }
            } else {
                rotulo.innerText = datos2.mensaje
            }
            break
        case 3:
            let acumulado = 0
            prestamo.coodeudores.forEach(coodeudor => {
                acumulado += coodeudor.monto
            })
            const cood_num_cedula = document.getElementById('cood_cedula_1').value
            const datos3 = await verificarCedula(cood_num_cedula)
            if (datos3.existe) {
                if (datos3.capital_libre >= (prestamo.monto_respaldado - acumulado)) {
                    prestamo.coodeudores.push({ nombre: datos3.nombre, cedula: cood_num_cedula, monto: prestamo.monto_respaldado - acumulado })
                    rotulo.innerText = `Los ${prestamo.coodeudores.length} usuarios invitados pueden avalar el total del préstamo.`
                    e.target.value = 'Solicitar'
                    estado = 4
                } else {
                    rotulo.innerText = `El saldo libre de ${datos3.nombre} es de $${agregarPuntosCentenas(datos3.capital_libre)}. Faltan por avalar $${agregarPuntosCentenas(Math.floor(prestamo.monto - (acumulado + datos3.capital_libre)))}`
                    prestamo.coodeudores.push({ nombre: datos3.nombre, cedula: cood_num_cedula, monto: datos3.capital_libre })
                }
                producirTablaCoodeudores(prestamo.coodeudores)
            } else {
                rotulo.innerText = datos3.mensaje
            }
            break
        case 4:
            aplicarPrestamo()
            break
        default:
            return
    }
}

function aplicarPrestamo() {
    let permitido = true
    let mensaje = ''
    if (prestamo.monto === 0 || prestamo.monto === '') {
        permitido = false
        mensaje = 'Por favor ingrese un monto a solicitar.'
    }

    if (prestamo.cuotas === '' || prestamo.cuotas === '0') {
        permitido = false
        mensaje = 'Por favor ingrese un número de cuotas.'
    }

    if (prestamo.fecha_inicial === '') {
        permitido = false
        mensaje = 'Seleccione una fecha.'
    }

    if (!permitido) {
        rotulo.innerText = mensaje
        return
    }

    rotulo.innerText = 'Aplicando su préstamo, espere un momento por favor...'

    fetch('api/aplicar_prestamo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(prestamo)
    }).then(async function (response) {
        if (response.ok) {
            rotulo.innerText = 'Solicitud realizada.'
        } else {
            console.log(response)
            rotulo.innerText = 'Ha ocurrido un error. Por favor reportelo a Alejo.'
        }
    }).catch(async function (error) {
        rotulo.innerText = 'Ha ocurrido un error. Por favor reportelo a Alejo.'
    })
}