const express = require('express')
const app = express()
const config = require('./config')

const { errorHandler, errorLogger, errorWrapper } = require('./utils/middlewares/error_handers')

const routes = require('./routes')

const notFoundHandler = require('./utils/middlewares/not_found_handler')

app.use(express.json())

routes(app)
app.use(notFoundHandler)

app.use(errorLogger)
app.use(errorWrapper)
app.use(errorHandler)

app.listen(config.port, () => {
    console.log(`listening port ${config.port}`)
})