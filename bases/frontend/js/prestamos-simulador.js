const bot_prev = document.getElementById('bot_previsualizar')


function generarFila(tipo, contenido, contenedor) {
    const fila = document.createElement('tr')
    contenido.forEach(elemento => {
        let columna = document.createElement(tipo)
        columna.innerText = elemento
        fila.appendChild(columna)
    })
    contenedor.appendChild(fila)
}

bot_prev.addEventListener('click', evento => {
    const cuotas = (formulario.querySelector('#cuotas').value === '')
        ? 1
        : formulario.querySelector('#cuotas').value
    const monto = formulario.querySelector('#monto').value

    const tabla = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    generarFila('th', ['Cuota', 'Abono a capital', 'Interés', 'Total cuota'], thead)

    let cuota = Math.ceil(monto / cuotas)
    let interes = 0
    let totalCuota = 0
    let acumulado = 0
    for (i = 0; i < cuotas; i++) {
        interes = Math.ceil((monto - (cuota * i)) * 0.008)
        acumulado += cuota
        if (i === cuotas - 1 && acumulado > monto) {
            cuota = monto - (acumulado - cuota)
        }
        totalCuota = cuota + interes
        generarFila('td', [i + 1, cuota, interes, totalCuota], tbody)
    }
    tabla.appendChild(thead)
    tabla.appendChild(tbody)
    document.getElementById('tabla_prev').innerHTML = ''
    document.getElementById('tabla_prev').append(tabla)
})