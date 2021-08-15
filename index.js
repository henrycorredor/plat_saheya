const express = require('express')
const app = express()
const config = require('./config')

const routes = require('./routes')

routes(app)

app.listen(config.port, () => {
    console.log(`listening port ${config.port}`)
})