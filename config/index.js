require('dotenv').config()

module.exports = {
    dev: process.env.NODE_ENV === 'development',
    port: process.env.PORT || 3000,
    dbUrl: process.env.DB_URL,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    jwtSecret: process.env.JWT_SECRET
}