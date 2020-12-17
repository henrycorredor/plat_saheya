function ajax(url, datos) {
    return new Promise((resuelto, rechazado) => {
        fetch(url, datos)
            .then(function (response) {
                if (response.ok) {
                    resuelto(response)
                } else {
                    rechazado(response)
                }
            }).catch(error => {
                rechazado(error)
            })
    })
}

async function prestamos(id, accion) {
    try {
        const datos = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(
                {
                    prestamo_id: id,
                    accion: accion
                }
            )
        }
        const resultado = await ajax('api/apr_prestamo', datos)
        const res_util = await resultado.json()
        document.querySelectorAll(`#columna_${id} .boton`).forEach(boton => {
            boton.innerHTML = ''
        })
        if (res_util.body.res) {
            document.querySelector(`#columna_${id} .aprobar`).innerText = res_util.body.mensaje
        } else {
            document.querySelector(`#columna_${id} .aprobar`).innerText = "Error. Por favor reportelo."
        }
    } catch (error) {
        document.querySelectorAll(`#columna_${id} .boton`).forEach(boton => {
            boton.innerHTML = ''
        })
        document.querySelector(`#columna_${id} .aprobar`).innerText = "Error. Por favor reportelo."
    }
}