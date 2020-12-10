const formulario = document.getElementById('formulario')
formulario.addEventListener('submit', manejadorFormulario)

async function manejadorFormulario(evento) {
    evento.preventDefault()
    let datosBruto = []
    document.querySelectorAll('.enviar').forEach(elemento => {
        datosBruto.push([elemento.name, elemento.value])
    })
    datos = Object.fromEntries(datosBruto)

    let mensaje_resultado = ''
    try {
        console.log(datos)
        await postDatosComoJson('/api/inscribir', datos)
        mensaje_resultado = 'Agregado'
        Array.from(formulario.getElementsByTagName('input')).map(campo => campo.disabled = true)
    } catch (error) {
        const mensaje = JSON.parse(error.message)
        mensaje_resultado = (mensaje.body === 'El usuario ya existe, verifique e intentelo de nuevo')
            ? mensaje.body : 'Hubo un error. Por favor intente nuevamente mas tarde.'
    }
    document.getElementById('pantalla').innerText = mensaje_resultado
}

async function postDatosComoJson(url, datos) {
    const respuesta = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(datos)
    })

    if (!respuesta.ok) {
        const mensaje = await respuesta.text()
        throw new Error(mensaje)
    }

    return respuesta.json()
}