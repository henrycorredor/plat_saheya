import React from 'react'
import { Link } from 'react-router-dom'

function PlantillaInterna(accesorios) {
    return (
        <div className="contenedor-interno pantalla-completa plantilla-interna">
            <nav class="oculto">
                <ul>
                    <li><Link to="/estado-cuenta">Estados de cuenta</Link></li>
                    <li><Link to="/prestamos">Préstamos</Link></li>
                    <li><Link to="/registrar-pagos">Registrar pagos</Link></li>
                    <li><Link to="/datos-personales">Datos personales</Link></li>
                </ul>
            </nav>
            <div id="header-paquete">
                <header>
                    <div id="foto-de-perfil"><img src="img/avatar-henry.jpg" height="78" width="78" alt="Henry A" /></div>
                    <div id="titulos">
                        <h1>Henry Alejandro</h1>
                        <h2>Miembro activo - Encargado del IT</h2>
                    </div>
                </header>
            </div>
            <section id="contenedor-seccion">
                {accesorios.children}
            </section>
        </div>
    )
}

export default PlantillaInterna