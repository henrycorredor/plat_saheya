import React from 'react'
import Lista from '../componentes/lista'

class Listas extends React.Component {
    render() {
        return (
            <React.Fragment>
                <h1>Listas</h1>
                <Lista datos={this.props.datos} />
            </React.Fragment>
        )
    }
}

export default Listas