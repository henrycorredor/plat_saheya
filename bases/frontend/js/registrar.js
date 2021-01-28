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
            console.log('Success:', result);
        })
        .catch(error => {
            console.log('Error:', error);
        })
})