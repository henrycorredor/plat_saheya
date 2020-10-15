import React from "react"
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Plantilla from '../componentes/plantilla'

import Formulario from "../paginas/formulario"
import Listas from "../paginas/listas"
import Portada from "../paginas/portada"

class Aplicacion extends React.Component {
    state = {
        datos: []
    }

    componentDidMount() {
        console.log("component did mount")
        this.temporizador = setTimeout(() => {
            this.setState({
                datos: [
                    {
                        "nombre": "Calcetin",
                        "nombre_chino": "小袜子",
                        "duenio": "Nieves y Henry"
                    },
                    {
                        "nombre": "Vicky",
                        "nombre_chino": "无",
                        "duenio": "Javiera"
                    }
                ]
            })
        }, 5000)
    }

    componentDidUpdate(accesoriosPrevios, estadosPrevios){
        console.log("componentDidUpdate")
    }

    componentWillUnmount(){
        console.log("bye")
        clearTimeout(this.temporizador)
    }

    render() {
        console.log("render")
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Portada} />
                    <Plantilla>
                        <Route exact path="/lista" render={(props) => <Listas {...props} datos={this.state.datos} />} />
                        <Route exact path="/formulario" render={(props) => <Formulario {...props} datos={this.state.datos} />} />
                    </Plantilla>
                </Switch>
            </BrowserRouter>
        )
    }
}

export default Aplicacion