import React from 'react'
import PlantillaInterna from '../plantillas/interna'

class EstadoCuenta extends React.Component {
    render() {
        return (
            <PlantillaInterna>
                <div id="resumen">
                    <div class="cilindro" id="capital-libre">
                        <h3>Capital libre</h3>
                        <div class="cilindro-valor">$1'146.904</div>
                    </div>
                    <div class="cilindro" id="por-cobrar">
                        <h3>Cuentas por cobrar</h3>
                        <div class="cilindro-valor">$3'471.650</div>
                    </div>
                    <div class="cilindro" id="cupo-prestado">
                        <h3>Cupo prestado</h3>
                        <div class="cilindro-valor">$621.870</div>
                    </div>
                </div>
            </PlantillaInterna>
        )
    }
}

export default EstadoCuenta