const formulario = document.getElementsByTagName('form')[0]
const rotulo = document.getElementById('form_aviso')
const bot_solicitar = document.getElementById('bot_solicitar')
const prestamo = {
    monto: 0,
    fecha_inicial: '',
    monto_respaldado: 0,
    maximo_permitido: Math.ceil((mi_capital * (procent_capital_permitido / 100)) - en_deuda),
    cuotas: 0,
    coodeudores: []
}

let estado = 1
/*ESTADOS DE LA PASARELA
1 - se ingresa el monto, si supera el permitido, pasa al estado 2, si no, se aplica directamente
2 - se verifica un coodeudor, si no es suficiente, se verifican multiples coodeudores
3 - se elabora verificacion con multiples coodeudores con multiples montos
4 - los datos son integros y se puede entregar la solicitud
*/

formulario.addEventListener('submit', evento => {
    evento.preventDefault()
})

document.getElementById('monto').addEventListener('input', evento => {
    prestamo.monto = evento.target.value
    if (prestamo.monto > prestamo.maximo_permitido) {
        prestamo.monto_respaldado = Math.ceil(prestamo.monto - prestamo.maximo_permitido)
        bot_solicitar.value = 'Invitar coodeudor'
        rotulo.innerText = `Monto superior al autorizado. Puede invitar un coodeudor para respaldar $${agregarPuntosCentenas(prestamo.monto_respaldado)}.`
    } else {
        prestamo.monto_respaldado = 0
        rotulo.innerText = ""
        bot_solicitar.value = 'Solicitar'
    }
})

document.getElementById('cuotas').addEventListener('input', e => {
    prestamo.cuotas = e.target.value
})

document.getElementById('fecha_inicial').addEventListener('input', e => {
    prestamo.fecha_inicial = e.target.value
})

function verificarCedula(numero_cedula) {
    return new Promise((resuelto, rechazado) => {
        fetch(`api/verificar_coodeudor?num_identificacion=${numero_cedula}`)
            .then(async res => {
                if (res.ok) {
                    const dato = await res.json()
                    resuelto(dato.body)
                } else {
                    rotulo.innerText = 'Ha ocurrido un error. Por favor reportelo a Alejo.'
                }
            }).catch(e => {
                rotulo.innerText = 'Ha ocurrido un error. Por favor reportelo a Alejo.'
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

bot_solicitar.addEventListener('click', async e => {
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
                document.getElementById('form_pasarela_2').style.display = 'block'
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
})

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