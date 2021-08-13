const express = require('express')
const app = express()
const config = require('./config/config')

const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('./utils/documentation/swagger.json')

const routes = require('./routes')

app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
routes(app)

app.listen(config.port, () => {
    console.log(`liste port ${config.port}`)
})