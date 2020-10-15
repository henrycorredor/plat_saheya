import React from 'react'
import { Link } from 'react-router-dom'

function Plantilla(accesorios) {
    return (
        <div id="contenedor_plantilla">
            <div id="header">
                <ul className="menu_general">
                    <li><Link to="/">Portada</Link></li>
                    <li><Link to="/lista">Lista</Link></li>
                    <li><Link to="/formulario">Formulario</Link></li>
                </ul>
            </div>
            <section>
                {accesorios.children}
            </section>
        </div>
    )
}


export default Plantilla