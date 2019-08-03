const hapi = require('hapi')
const mongoose = require('mongoose')
const Blipp = require('blipp')
const Bcrypt = require('bcrypt')

const googleBooksPlugin = require('./plugins/google-books-plugin')
const booksPlugin = require('./plugins/books-plugin')
const authPlugin = require('./plugins/auth-plugin')
const User = require('./models/User')
require('dotenv').config()

const PORT = process.env.PORT || 4000

const server = hapi.server({
    port: PORT,
    host: process.env.HAPI_HOST,
    routes: { cors: true}
})


const validate = async (request, username, password) => {
    let isValid = false
    let credentials = null

    const user = await User.find({username: username})
    if (user) {
        isValid = await Bcrypt.compare(password, user[0].password)
        credentials = { _id: user[0]._id, username: user[0].username, role: user[0].role, active: user[0].active, email: user[0].email } 
    }
    return {isValid, credentials}
   
}

const init = async () => {
    await server.register(require('@hapi/basic'));
    server.auth.strategy('simple', 'basic', { validate });

    await server.register({ plugin: authPlugin, options: { auth: 'simple'} })
    await server.register({ plugin: booksPlugin, options: { auth: 'simple'} })
    await server.register({ plugin: googleBooksPlugin, options: { auth: 'simple'}})

    await server.register({ plugin: Blipp, options: { showAuth: true } })
    server.route([
        {
            method: 'GET',
            path: '/routes',
            options: {
                auth: 'simple'
            },
            handler: (request, h) => {
                return request.server.plugins.blipp.info();
            }
        }
    ])
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
}

init()

let uri = process.env.DB_CONN
mongoose.connect(uri)
mongoose.connection.once('open', () => {
    console.log('connected to database')
})
