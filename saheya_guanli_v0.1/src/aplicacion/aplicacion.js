import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Portada from "../paginas/portada"
import DatosPersonales from "../paginas/datosPersonales"
import EstadoCuenta from "../paginas/estadoCuenta"
import Prestamos from "../paginas/prestamos"
import RegistrarPagos from "../paginas/registrarPagos"

function Aplicacion() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={Portada} />
                <Route exact path="/datos-personales" component={DatosPersonales} />
                <Route exact path="/estado-cuenta" component={EstadoCuenta} />
                <Route exact path="/prestamos" component={Prestamos} />
                <Route exact path="/registrar-pagos" component={RegistrarPagos} />
            </Switch>
        </BrowserRouter>
    )
}

export default Aplicacion