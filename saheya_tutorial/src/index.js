// const elemento = document.createElement('h1')
// elemento.innerText = "Hola pecuecas"

// const contenedor = document.getElementById('contenedor_general')

// contenedor.appendChild(elemento)

import React from 'react'
import ReactDOM from 'react-dom'

import Aplicacion from "./componentes/aplicacion"

import "./global.css"

//ps - React.createElement(__elemento__,__atributos__,__children__)
// todo lo que esté entre las llaves se evalua, por ejemplo 2+2 o una funcion ()
//const elementoA = React.createElement('a',{ href:'http://www.bing.com' },elementoH1)

//ps - ReactDOM.render(__qué__,__dónde__)

ReactDOM.render(<Aplicacion />,document.getElementById('contenedor_general'))

