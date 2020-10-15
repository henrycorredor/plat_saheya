import React from 'react'
import calcetas from '../imagenes/calcetas.jpg'
import { Link } from "react-router-dom"

class FormCalcetas extends React.Component {
    render() {
        console.log()
        return (
            <div id="portada_contenedor">
                <h1>HOLA A TODOS</h1>
                <p>Esta es la lista de amigos de Calcetas</p>
                <img src={calcetas} alt="Foto del calcetas" />
                <p>Encontrarás la lista de todas las mascotas que han pasado por la casa de Henry y Nieves.</p>
                <Link to="/lista"><span className="bot-entrar">Entrar</span></Link>
            </div>
        )
    }
}

export default FormCalcetas