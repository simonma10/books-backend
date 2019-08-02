const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema ({
    username: String,
    password: String,
    email: String,
    role: String,
    active: Boolean
})

module.exports = mongoose.model('User', UserSchema)