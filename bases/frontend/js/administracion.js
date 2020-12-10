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
        console.log(res_util.body)
    } catch (error) {
        console.log('Se registro un error: ' + error)
    }
}