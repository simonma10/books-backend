const hapi = require('hapi')
const mongoose = require('mongoose')
const Blipp = require('blipp')
const googleBooksPlugin = require('./plugins/google-books-plugin')
const booksPlugin = require('./plugins/books-plugin')
const CONFIG = require('./config')

const server = hapi.server({
    port: 4000,
    host: 'localhost',
    routes: { cors: true}
})

const init = async () => {
    await server.register({ plugin: Blipp, options: { showAuth: true } });
    await server.register({ plugin: googleBooksPlugin})
    await server.register({ plugin: booksPlugin })

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

let uri = createUri(CONFIG.DB)
mongoose.connect(uri)
mongoose.connection.once('open', () => {
    console.log('connected to database')
})

function createUri(config) {
    //console.log('config: ', config)
    let uri = 'mongodb'
    // local db doesn't use username/password
    if (config.user === ""){
        uri += '://'
    } else {
        uri += '+srv://' + config.user + ':' + config.password + '@'
    }
    uri += config.server + '/' + config.database
    // parse query params
    for (let i = 0; i < config.params.length; i++){
        uri += (i < 1 ? '?' : '&')
        uri += config.params[i]
    }
    return uri
}