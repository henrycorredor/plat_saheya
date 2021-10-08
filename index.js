const config = require('./config')
const routes = require('./routes')
const passport = require('passport')

const express = require('express')
const app = express()

require('./config/passport')(passport)

const { errorHandler, errorLogger, errorWrapper } = require('./utils/middlewares/error_handers')
const notFoundHandler = require('./utils/middlewares/not_found_handler')

app.use(express.json())

app.use(passport.initialize())

routes(app)

app.use(notFoundHandler)
app.use(errorLogger)
app.use(errorWrapper)
app.use(errorHandler)

app.listen(config.port, () => {
    console.log(`listening port ${config.port}`)
})