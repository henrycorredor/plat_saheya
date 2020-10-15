import React from 'react'

class Lista extends React.Component {
    render() {
        return (
            <ul>
                {this.props.datos.map((entrada, indice) => {
                    return (<li key={indice}>
                        Nombre: {entrada.nombre}, <br />
                        Nombre chino: {entrada.nombre_chino}, <br />
                        Dueño: {entrada.duenio}
                    </li>)
                })}
            </ul>
        )
    }
}

export default Lista