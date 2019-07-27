const hapi = require('hapi')
const mongoose = require('mongoose')
const Blipp = require('blipp')
const googleBooksPlugin = require('./plugins/google-books-plugin')
const booksPlugin = require('./plugins/books-plugin')
require('dotenv').config()

const PORT = process.env.PORT || 4000

const server = hapi.server({
    port: PORT,
    host: process.env.HAPI_HOST,
    routes: { cors: true}
})


const init = async () => {
    
    await server.register({ plugin: googleBooksPlugin})
    await server.register({ plugin: booksPlugin })

    await server.register({ plugin: Blipp, options: { showAuth: true } })
    server.route([
        {
            method: 'GET',
            path: '/routes',
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
