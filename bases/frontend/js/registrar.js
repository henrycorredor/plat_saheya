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

const formulario = document.getElementsByTagName('form')[0]

formulario.addEventListener('submit', evento => {
    evento.preventDefault()
    let datos = {}
    Array.from(evento.target.getElementsByTagName('input')).forEach(elInput => {
        if ((!elInput.checked && elInput.type === 'radio') || elInput.name === '') {
            console.log(elInput, 'no pasa')
            return
        } else {
            console.log(elInput, 'pasa')
            datos[elInput.name] = elInput.value
        }
    })
    console.log(datos)

    fetch('api/registrar_movimiento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(datos)
    }).then(async function (response) {
        if (response.ok) {
            const elDato = await response.json()
            console.log('respuesta ', elDato)
        }
    }).catch(function (error) {
        console.warn(error);
    });
})