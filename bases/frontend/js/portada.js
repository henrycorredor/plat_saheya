async function coodeudor(relacion_id, aprobado) {
    const contenedor = document.getElementById(`coodeudor_${relacion_id}`)
    const titulo = document.createElement('h1')
    const parametros = { relacion_id: relacion_id, aprobado: aprobado }
    try {
        const respuesta = await fetch(`api/autorizar_coodeudor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(parametros)
        })
        console.log(respuesta)
        const mensaje = await respuesta.json()
        titulo.innerText = (respuesta.ok) ? mensaje.body.mensaje : 'Ha ocurrido un error en el sistema. Por favor reportelo a Alejo.'
    } catch (error) {
        titulo.innerText = 'Ha ocurrido un error en el sistema. Por favor reportelo a Alejo.'
    }
    contenedor.innerHTML = ''
    contenedor.appendChild(titulo)
}