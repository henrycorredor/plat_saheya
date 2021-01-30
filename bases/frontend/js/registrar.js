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
            recibirFoto(result.body.mensaje)
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