const formVariable = document.getElementById('form_variable')

function generarInput(type, name, labelInnerText) {
    const elLabel = document.createElement('label')
    elLabel.setAttribute('for', name)
    elLabel.innerText = labelInnerText

    const elInput = document.createElement('input')
    elInput.setAttribute('type', type)
    elInput.setAttribute('name', name)

    return [elLabel, elInput]
}

function ingresarAlFormulario(arrayElementos) {
    formVariable.innerHTML = ''
    arrayElementos.map(elemento => {
        const p = document.createElement('p')
        p.append(elemento[0], elemento[1])
        formVariable.appendChild(p)
    })
    formVariable.appendChild(document.createElement('span'))
}

function formAporte() {
    ingresarAlFormulario([
        generarInput('number', 'monto', 'Monto: '),
        generarInput('date', 'fecha_realizacion', 'Fecha de transacción: '),
        generarInput('text', 'comentario', 'Comentario: ')
    ])
}

function formAbonoDeuda() {
    ingresarAlFormulario([
        generarInput('number', 'monto', 'Monto: '),
        generarInput('number', 'interes', "Interés: "),
        generarInput('date', 'fecha_realizacion', 'Fecha de transacción: '),
        generarInput('text', 'comentario', 'Comentario: ')
    ])
}

document.querySelectorAll("input[name='motivo']").forEach(elemento => {
    elemento.addEventListener('change', evento => {
        evento.target.value === '1' ?
            formAporte() :
            formAbonoDeuda()
    })
})

function escaparCaracteres(cadena) {
    const equivalencias = [
        ["'", "[comilla]"],
        ['"', '[comilla]'],
        ["%", "[porciento]"],
        ["_", "[guionbajo]"]
    ]

    let salidaCadena = cadena
    const comparar = (caracteres) => {
        const busqueda = new RegExp(`${caracteres[0]}`, "g")
        salidaCadena = salidaCadena.replace(busqueda, `${caracteres[1]}`)
    }
    equivalencias.map(comparar)
    return salidaCadena
}

const formulario = document.getElementsByTagName('form')[0]

formulario.addEventListener('submit', evento => {
    evento.preventDefault()
    let datos = {}
    Array.from(evento.target.getElementsByTagName('input')).forEach(elInput => {
        if ((!elInput.checked && elInput.type === 'radio') || elInput.name === '') {
            return
        } else {
            datos[elInput.name] = elInput.value
        }
    })
    datos.comentario = escaparCaracteres(datos.comentario)
    fetch('api/registrar_movimiento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(datos)
    }).then(async function (response) {
        if (response.ok) {
            document.querySelectorAll('#form_variable span')[0].innerText = 'Registro realizado.'
        }
        const elDato = await response.json()
        console.log('miau', elDato)
    }).catch(async function (error) {
        console.warn(error)
        const elDato = await error.json()
        console.log('miau', elDato)
        document.querySelectorAll('#form_variable span')[0].innerText = 'Ha ocurrido un error. Por favor reportelo a Alejo.'
    });
})