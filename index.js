const express = require('express')
const app = express()
const config = require('./config')

const { errorHandler, errorLogger, errorWrapper } = require('./utils/errorHanders')

const routes = require('./routes')

app.use(express.json())

routes(app)

app.use(errorLogger)
app.use(errorWrapper)
app.use(errorHandler)

app.listen(config.port, () => {
    console.log(`listening port ${config.port}`)
})