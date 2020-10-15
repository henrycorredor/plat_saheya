import React from 'react'

function PlantillaExterna(accesorios) {
    return (
        <div className="contenedor-externo pantalla-completa plantilla-externa">
            <div className="contenedor-elementos">
                {accesorios.children}
            </div>
        </div>
    )
}

export default PlantillaExterna