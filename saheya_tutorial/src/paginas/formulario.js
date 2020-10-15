import React from 'react'

class Formulario extends React.Component {
    state = {
        datosForm: {
            nombre: "",
            nombre_chino: "",
            duenio: ""
        }
    }

    manejadorCambioForm = evento => {
        this.setState({
            datosForm: {
                ...this.state.datosForm,
                [evento.target.name]: evento.target.value
            }
        })
    }

    manejadorEntregarBoton = evento => {
        evento.preventDefault()
        this.props.datos.push(this.state.datosForm)
        console.log("entregar formulario / manejador formulario / agregado elemento")
    }

    render() {
        return (
            <React.Fragment>
                <h1>Formulario</h1>
                <div className="confirmar_datos">
                    Quiere usted incluir a: {this.state.datosForm.nombre}<br />
                    Nombre en chino: {this.state.datosForm.nombre_chino}<br />
                    Dueño: {this.state.datosForm.duenio}
                </div>
                <form>
                    <label>Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        onChange={this.manejadorCambioForm}
                    /><br />
                    <label>Nombre chino</label>
                    <input
                        type="text"
                        name="nombre_chino"
                        onChange={this.manejadorCambioForm}
                        value={this.state.datosForm.nombre_chino}
                    /><br />
                    <label>Dueño</label>
                    <input
                        type="text"
                        name="duenio"
                        onChange={this.manejadorCambioForm}
                        value={this.state.datosForm.duenio}
                    /><br />
                    <button type="button" onClick={this.manejadorEntregarBoton} />
                </form>
            </React.Fragment>
        )
    }
}

export default Formulario