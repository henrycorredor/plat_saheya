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

let aval_en_proceso = 0

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
    } else {
        prestamo.monto_respaldado = 0
        rotulo.innerText = rotuloTextoOriginal
        bot_solicitar.disabled = false
        pasarela_paso_2.style.display = 'none'
    }
})

document.getElementById('cuotas').addEventListener('input', e => {
    prestamo.cuotas = e.target.value
})

document.getElementById('fecha_inicial').addEventListener('input', e => {
    prestamo.fecha_inicial = e.target.value
})

document.getElementById('bot_revisar').addEventListener('click', async e => {
    const cedula = document.getElementById('input_cand_coodeudor').value
    rotulo_coodeudor.style.display = 'block'
    rotulo_coodeudor.innerText = 'Espere un momento por favor...'
    let proceder = true
    prestamo.coodeudores.forEach(coodeudor => {
        if (coodeudor.cedula === cedula) {
            rotulo_coodeudor.innerText = 'Este usuario ya está en la lista. Por favor verifique y vuelva a intentarlo.'
            proceder = false
        }
    })
    if (proceder) {
        try {
            const datos = await verificarCedula(cedula)
            if (datos.existe) {
                procesar_coodeudores(datos)
            } else {
                rotulo_coodeudor.innerText = datos.mensaje
            }
        } catch (error) {
            let mensaje = (!error.mensaje) ? 'Ha habido un error en el sistema, por favor reporte a Alejo.' : error.mensaje
            console.log(error)
            document.getElementById('coodeduor_rotulo').innerText = mensaje
            e.target.disabled = true
        }
    }
})

function procesar_coodeudores(datos) {
    rotulo_coodeudor.style.display = 'block'
    if (parseInt(datos.capital_libre) === 0) {
        rotulo_coodeudor.innerText = `${datos.nombre} no tiene cupo disponible. Por favor solicite soporte a otro usuario.`
        input_cand_coodeudor.value = ''
    } else if (datos.capital_libre >= prestamo.monto_respaldado && aval_en_proceso === 0) {
        rotulo_coodeudor.innerText = `El cupo de ${datos.nombre} es suficiente para respaldar su crédito. ¿Confirma que desea invitarlo como coodeudor?`
        const aceptar = generarDOM('a', { innerText: 'Si' }, rotulo_coodeudor)
        const cancelar = generarDOM('a', { innerText: 'No' }, rotulo_coodeudor)
        aceptar.addEventListener('click', e => {
            e.preventDefault()
            prestamo.coodeudores.push({
                nombre: datos.nombre,
                cedula: input_cand_coodeudor.value,
                monto: prestamo.monto_respaldado
            })
            pasarela_paso_2.style.display = 'none'
            rotulo.innerText = `Su solicitud de préstamo es de ${agregarPuntosCentenas(prestamo.monto)}, con un monto avalado por ${prestamo.coodeudores[0].nombre} por la suma de ${agregarPuntosCentenas(prestamo.coodeudores[0].monto)}. Puede proceder con la solicitud.`
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
            rotulo_coodeudor.innerText = `${datos.nombre} solo puede avalar $${agregarPuntosCentenas(datos.capital_libre)}. ¿Desea agregarlo a la lista de coodeudores y seguir invitando coodeudores?`
            const aceptar = generarDOM('a', { innerText: 'Si' }, rotulo_coodeudor)
            const cancelar = generarDOM('a', { innerText: 'No' }, rotulo_coodeudor)
            aceptar.addEventListener('click', e => {
                e.preventDefault()
                prestamo.coodeudores.push({
                    nombre: datos.nombre,
                    cedula: input_cand_coodeudor.value,
                    monto: parseInt(datos.capital_libre)
                })
                aval_en_proceso += parseInt(datos.capital_libre)
                rotulo_coodeudor.innerText = 'Por favor inserte el número de cédula del siguiente coodeudor.'
                producirTablaCoodeudores()
                input_cand_coodeudor.value = ''
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
            rotulo_coodeudor.innerText = `${datos.nombre} puede avalar $${agregarPuntosCentenas(prestamo.monto_respaldado - aval_en_proceso)}. Una vez lo agregue a la lista de coodeudores puede proceder con la solicitud. ¿Desea agregarlo?`
            const aceptar = generarDOM('a', { innerText: 'Si' }, rotulo_coodeudor)
            const cancelar = generarDOM('a', { innerText: 'No' }, rotulo_coodeudor)
            aceptar.addEventListener('click', e => {
                e.preventDefault()
                prestamo.coodeudores.push({
                    nombre: datos.nombre,
                    cedula: input_cand_coodeudor.value,
                    monto: prestamo.monto_respaldado - aval_en_proceso
                })
                aval_en_proceso += parseInt(prestamo.monto_respaldado - aval_en_proceso)
                document.getElementById('coodeudor_1').style.display = 'none'
                rotulo_coodeudor.style.display = 'none'
                bot_solicitar.disabled = false
                producirTablaCoodeudores()
                rotulo.innerText = 'Puede proceder con la solicitud.'
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

function producirTablaCoodeudores() {
    const contenedor = document.getElementById('tabla_coodeudores')
    contenedor.innerHTML = ''
    let total_acumulado = 0
    if (prestamo.coodeudores.length > 0) {
        contenedor.style.display = 'block'
        const tabla = generarDOM('table', '', contenedor)
        const thead = generarDOM('thead', '', tabla)
        generarDOM('th', { innerText: 'Nombre' }, thead)
        generarDOM('th', { innerText: 'Monto avalado' }, thead)
        const tbody = generarDOM('tbody', '', tabla)
        prestamo.coodeudores.forEach((usuario, indice) => {
            const tr = generarDOM('tr', '', tbody)
            generarDOM('td', { innerText: usuario.nombre }, tr)
            generarDOM('td', { innerText: "$" + agregarPuntosCentenas(usuario.monto) }, tr)
            const bot_el_cont = generarDOM('td', '', tr)
            const bot_eliminar = generarDOM('a', { innerText: 'Eliminar' }, bot_el_cont)
            bot_eliminar.addEventListener('click', e => {
                e.preventDefault()
                aval_en_proceso -= prestamo.coodeudores[indice].monto
                console.log(prestamo.coodeudores[indice].nombre, prestamo.coodeudores[indice].monto)
                prestamo.coodeudores.splice(indice, 1)
                document.getElementById('coodeudor_1').style.display = 'block'
                rotulo_coodeudor.style.display = 'block'
                rotulo_coodeudor.innerText = 'Por favor inserte un número de cédula.'
                bot_solicitar.disabled = true
                input_cand_coodeudor.value = ''
                rotulo.innerText = `Faltan $${agregarPuntosCentenas(prestamo.monto_respaldado - aval_en_proceso)} por avalar.`
                producirTablaCoodeudores()
            })
            total_acumulado += parseInt(usuario.monto)
        })
        const tr = generarDOM('tr', '', tabla)
        generarDOM('td', { innerText: 'Total avalado: ' }, tr)
        generarDOM('td', { innerText: "$" + agregarPuntosCentenas(total_acumulado), colspan: '2' }, tr)
    } else {
        contenedor.style.display = 'none'
    }
}

bot_solicitar.addEventListener('click', e => {
    let permitido = true
    let mensaje = ''
    if (prestamo.monto === 0 || prestamo.monto === '') {
        permitido = false
        mensaje = 'Por favor ingrese un monto a solicitar.'
    }

    if (prestamo.cuotas === '' || prestamo.cuotas === 0) {
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
        const dato = await response.json()
        rotulo.innerText = dato.body.mensaje
    }).catch(function (error) {
        rotulo.innerText = 'Ha ocurrido un error. Por favor reportelo a Alejo.'
    })
})