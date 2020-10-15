import React from 'react'
import PlantillaExterna from '../plantillas/externa'

class Acceso extends React.Component {
    render() {
        return (
            <PlantillaExterna>
                <form id="formulario-ingreso" name="formulario-ingreso">
                    <h1>Sociedad Salamanca Hermanos y Asociados SAHEYA</h1>
                    <label for="usuario">Número de cédula</label>
                    <input type="text" id="usuario" autofocus placeholder="Número de cédula" />
                    <label for="contrasena">Contraeña</label>
                    <input type="password" id="contrasena" />
                    <div id="recordarContDiv">
                        <input type="checkbox" id="recordarContrasena" />
                        <label for="recordarContrasena" id="labelRecordar">Recordar contraseña</label>
                    </div>
                    <input type="button" id="botonIngresar" name="Ingresar" value="Ingresar" />
                </form>
            </PlantillaExterna>
        )
    }
}

export default Acceso