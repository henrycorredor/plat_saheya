// const elemento = document.createElement('h1')
// elemento.innerText = "Hola pecuecas"

// const contenedor = document.getElementById('contenedor_general')

// contenedor.appendChild(elemento)

import React from 'react'
import ReactDOM from 'react-dom'

import Tarjeta from "./componentes/tarjeta"

import "./global.css"

const contenedor = document.getElementById('contenedor_general')

//ps - React.createElement(__elemento__,__atributos__,__children__)
const persona = "zoquetes"
// todo lo que esté entre las llaves se evalua, por ejemplo 2+2 o una funcion ()
const elElemento = <div>
    <h1>Hola {persona} actualizado</h1>
    <Tarjeta />
    </div>
//const elementoA = React.createElement('a',{ href:'http://www.bing.com' },elementoH1)

//ps - ReactDOM.render(__qué__,__dónde__)
ReactDOM.render(elElemento,contenedor)
