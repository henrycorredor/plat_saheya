import React from 'react'
import calcetas from '../imagenes/calcetas.jpg'
import "./css/tarjeta.css"

class Tarjeta extends React.Component {
    render() {
        return(
            <div className="compo_tarjeta">
                <h1>El título de la tarjeta</h1>
                <img src={calcetas} alt="Foto del calcetas" />
            </div>
        )
    }
}

export default Tarjeta