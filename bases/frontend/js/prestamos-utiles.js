
function agregarPuntosCentenas(cifra) {
    return cifra.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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
