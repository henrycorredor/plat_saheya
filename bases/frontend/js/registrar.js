document.getElementById('formulario').addEventListener('submit', evento => {
    evento.preventDefault()

    const datos_formluario = new FormData()
    const archivo = document.querySelector('input[type="file"]')

    datos_formluario.append('recibo', archivo.files[0])
    console.log(datos_formluario)
    fetch('api/recibir_imagenes', {
        method: 'PUT',
        body: datos_formluario
    })
        .then(response => response.json())
        .then(result => {
            console.log(result.body)
            recibirFoto(result.body.pic_id)
            agregarFormulario(result.body)
        })
        .catch(error => {
            console.log('Error:', error);
        })
})

function recibirFoto(url) {
    const contenedor = document.getElementById('contenedor')
    contenedor.innerHTML = ''
    const imagen = document.createElement('img')
    imagen.setAttribute('src', `/api/pic_en_proceso/${url}`)
    contenedor.appendChild(imagen)
}

function generarDOM(tag, parametros, contenedor, antesDe) {
    const elemento = document.createElement(tag)
    for (const parametro in parametros) {
        if (parametro === 'innerText') {
            elemento.innerText = parametros[parametro]
        } else {
            elemento.setAttribute(parametro, parametros[parametro])
        }
    }
    if (!contenedor) {
        return elemento
    } else {
        if (!antesDe) {
            contenedor.appendChild(elemento)
        } else {
            contenedor.insertBefore(elemento, antesDe)
        }
    }
    return elemento
}


function agregarFormulario(datos) {
    const contenedor = document.getElementById('contenedor')
    generarDOM('p', { innerText: '¿Qué desea hacer?' }, contenedor)
    const el_formulario = generarDOM('form', { id: 'formulario_registro' }, contenedor)
    const div_contenedor = generarDOM('div', { class: 'item-form' }, el_formulario)
    generarDOM('p', { innerText: '¿Desea realizar un abono a capital?' }, div_contenedor)
    generarDOM('input', { type: 'checkbox' }, div_contenedor)
    datos.deudas.forEach((deuda, index) => {
        const div_cont = generarDOM('div', { class: 'item-form' }, el_formulario)
        generarDOM('p', { innerText: `¿Desea realizar un abono a la deuda #${deuda.id}?` }, div_cont)
        generarDOM('input', { type: 'checkbox' }, div_cont)
    })

}